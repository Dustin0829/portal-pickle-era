import { prisma } from "../../app/prisma.js";
import type { OpenPlaySessionStatus, Prisma } from "../../generated/prisma/client.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors.js";
import type { AuthUser } from "../auth/auth.constants.js";
import { OPEN_PLAY_FIFO_COURTS } from "../bookings/open-play-fifo.js";
import {
  findCallerParticipant,
  normalizeEmail,
  openPlayLiveBoardSelect,
  toOpenPlayLiveBoard,
} from "./open-play-live.mapper.js";
import {
  OPEN_PLAY_GAME_SEATS,
  planFirstWave,
  planSeats,
  rotateOnGameEnd,
} from "./open-play-live.rotation.js";
import type {
  OpenPlayLiveSessionKey,
  OpenPlayLiveSessionQuery,
  PatchOpenPlayLiveSessionBody,
  StartOpenPlayLiveGameBody,
} from "./open-play-live.schema.js";

type TxClient = Prisma.TransactionClient;

const allowedStatusTransitions: Record<OpenPlaySessionStatus, OpenPlaySessionStatus[]> = {
  upcoming: ["live", "cancelled"],
  live: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

/** Get-or-create the live session row (with its six courts) for a date + Open Play slot. */
async function ensureSession(key: OpenPlayLiveSessionKey) {
  const existing = await prisma.openPlaySession.findUnique({
    where: { date_slotId: { date: key.date, slotId: key.slotId } },
    select: { id: true, status: true },
  });
  if (existing) return existing;

  try {
    return await prisma.openPlaySession.create({
      data: {
        date: key.date,
        slotId: key.slotId,
        courts: {
          create: OPEN_PLAY_FIFO_COURTS.map((court) => ({
            courtId: court.id,
            courtLabel: court.label,
          })),
        },
      },
      select: { id: true, status: true },
    });
  } catch (error) {
    const raced = await prisma.openPlaySession.findUnique({
      where: { date_slotId: { date: key.date, slotId: key.slotId } },
      select: { id: true, status: true },
    });
    if (!raced) throw error;
    return raced;
  }
}

/** Approved Open Play bookings are the eligibility set; checked-in rows are never removed. */
async function syncParticipants(sessionId: string, key: OpenPlayLiveSessionKey) {
  const [bookings, participants] = await Promise.all([
    prisma.booking.findMany({
      where: {
        plan: "open_play",
        status: "approved",
        date: key.date,
        slotIds: { has: key.slotId },
      },
      select: { id: true, name: true, email: true, userId: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
    prisma.openPlayParticipant.findMany({
      where: { sessionId },
      select: { id: true, bookingId: true, status: true },
    }),
  ]);

  const known = new Set(participants.map((participant) => participant.bookingId));
  const missing = bookings.filter((booking) => !known.has(booking.id));
  if (missing.length > 0) {
    await prisma.openPlayParticipant.createMany({
      data: missing.map((booking) => ({
        sessionId,
        bookingId: booking.id,
        userId: booking.userId,
        name: booking.name,
        email: booking.email,
      })),
      skipDuplicates: true,
    });
  }

  const approved = new Set(bookings.map((booking) => booking.id));
  const revoked = participants.filter(
    (participant) => participant.status === "booked" && !approved.has(participant.bookingId),
  );
  if (revoked.length > 0) {
    await prisma.openPlayParticipant.deleteMany({
      where: { id: { in: revoked.map((participant) => participant.id) } },
    });
  }
}

async function loadBoard(sessionId: string, authUser?: AuthUser) {
  const row = await prisma.openPlaySession.findUnique({
    where: { id: sessionId },
    select: openPlayLiveBoardSelect,
  });
  if (!row) throw new NotFoundError("Open Play session not found");
  return toOpenPlayLiveBoard(row, authUser);
}

/** Rewrite the queue in one shot — ponytail: fine at ≤30 seats; switch to positional updates if sessions grow. */
async function writeQueue(tx: TxClient, sessionId: string, participantIds: string[]) {
  await tx.openPlayQueueEntry.deleteMany({ where: { sessionId } });
  if (participantIds.length === 0) return;
  await tx.openPlayQueueEntry.createMany({
    data: participantIds.map((participantId, index) => ({
      sessionId,
      participantId,
      position: index + 1,
    })),
  });
}

/** Board for a date + slot, materializing the session and participant roster on read. */
export async function getOpenPlayLiveBoard(query: OpenPlayLiveSessionQuery, authUser?: AuthUser) {
  const session = await ensureSession(query);
  await syncParticipants(session.id, query);
  return loadBoard(session.id, authUser);
}

/** Player board — caller must hold an approved Open Play seat for the session. */
export async function getMyOpenPlayLiveBoard(
  query: OpenPlayLiveSessionQuery,
  authUser: AuthUser | undefined,
) {
  if (!authUser) throw new UnauthorizedError();

  // Gate before materializing a session so players cannot create rows for arbitrary slots.
  const seat = await prisma.booking.findFirst({
    where: {
      plan: "open_play",
      status: "approved",
      date: query.date,
      slotIds: { has: query.slotId },
      OR: [{ userId: authUser.id }, { email: { equals: authUser.email, mode: "insensitive" } }],
    },
    select: { id: true },
  });
  if (!seat) {
    throw new NotFoundError("Open Play seat not found for this session");
  }

  const session = await ensureSession(query);
  await syncParticipants(session.id, query);

  const row = await prisma.openPlaySession.findUnique({
    where: { id: session.id },
    select: openPlayLiveBoardSelect,
  });
  if (!row) throw new NotFoundError("Open Play session not found");
  if (!findCallerParticipant(row, authUser)) {
    throw new NotFoundError("Open Play seat not found for this session");
  }

  return toOpenPlayLiveBoard(row, authUser);
}

export async function patchOpenPlayLiveSessionStatus(body: PatchOpenPlayLiveSessionBody) {
  const session = await ensureSession({ date: body.date, slotId: body.slotId });
  await syncParticipants(session.id, { date: body.date, slotId: body.slotId });

  if (session.status === body.status) {
    return loadBoard(session.id);
  }
  if (!allowedStatusTransitions[session.status].includes(body.status)) {
    throw new ConflictError(`Cannot move session from ${session.status} to ${body.status}`);
  }

  if (body.status === "completed") {
    const playing = await prisma.openPlayGame.count({
      where: { sessionId: session.id, status: "playing" },
    });
    if (playing > 0) {
      throw new ConflictError("End all active games before completing the session");
    }
  }

  await prisma.$transaction(async (tx) => {
    const moved = await tx.openPlaySession.updateMany({
      where: { id: session.id, status: session.status },
      data: { status: body.status },
    });
    if (moved.count !== 1) {
      throw new ConflictError("Session status changed, retry");
    }
    if (body.status === "live") {
      await seedFirstWave(tx, session.id);
    }
  });

  return loadBoard(session.id);
}

/** Optional opening wave: fill usable courts from whoever is already checked in. */
async function seedFirstWave(tx: TxClient, sessionId: string) {
  const [courts, waiting] = await Promise.all([
    tx.openPlayCourt.findMany({
      where: { sessionId },
      select: { id: true, courtId: true, state: true },
    }),
    tx.openPlayQueueEntry.findMany({
      where: { sessionId },
      orderBy: { position: "asc" },
      select: { participantId: true },
    }),
  ]);
  if (waiting.length < OPEN_PLAY_GAME_SEATS) return;

  const ordered = OPEN_PLAY_FIFO_COURTS.map((court) =>
    courts.find((row) => row.courtId === court.id),
  ).filter((row): row is (typeof courts)[number] => Boolean(row));

  const { assignments, queue } = planFirstWave({
    courts: ordered.map((court) => ({
      courtId: court.courtId,
      usable: court.state === "available" || court.state === "ready",
    })),
    waiting: waiting.map((entry) => entry.participantId),
  });

  for (const assignment of assignments) {
    const court = ordered.find((row) => row.courtId === assignment.courtId);
    if (!court) continue;
    await startGameOnCourt(tx, sessionId, court.id, assignment.participantIds);
  }

  await writeQueue(tx, sessionId, queue);
}

async function startGameOnCourt(
  tx: TxClient,
  sessionId: string,
  courtRowId: string,
  participantIds: string[],
) {
  const game = await tx.openPlayGame.create({
    data: { sessionId, courtRowId, status: "playing" },
    select: { id: true },
  });
  await tx.openPlayGameSeat.createMany({
    data: planSeats(participantIds).map((seat) => ({
      gameId: game.id,
      participantId: seat.participantId,
      side: seat.side,
      seatIndex: seat.seatIndex,
    })),
  });
  await tx.openPlayCourt.update({ where: { id: courtRowId }, data: { state: "playing" } });
  return game;
}

async function loadParticipantOrThrow(participantId: string) {
  const participant = await prisma.openPlayParticipant.findUnique({
    where: { id: participantId },
    select: {
      id: true,
      sessionId: true,
      status: true,
      session: { select: { status: true } },
    },
  });
  if (!participant) throw new NotFoundError("Participant not found");
  return participant;
}

async function isOnActiveGame(participantId: string) {
  const seat = await prisma.openPlayGameSeat.findFirst({
    where: { participantId, game: { status: "playing" } },
    select: { id: true },
  });
  return Boolean(seat);
}

export async function checkInParticipant(participantId: string) {
  const participant = await loadParticipantOrThrow(participantId);
  if (participant.session.status !== "live") {
    throw new ConflictError("Check-in is only allowed while the session is live");
  }
  if (participant.status === "no_show" || participant.status === "left_session") {
    throw new ConflictError("Participant is no longer active in this session");
  }

  await prisma.$transaction(async (tx) => {
    if (participant.status === "booked") {
      await tx.openPlayParticipant.update({
        where: { id: participant.id },
        data: { status: "checked_in", checkedInAt: new Date() },
      });
    }
    const queued = await tx.openPlayQueueEntry.findUnique({
      where: {
        sessionId_participantId: {
          sessionId: participant.sessionId,
          participantId: participant.id,
        },
      },
      select: { id: true },
    });
    if (queued) return;

    const playing = await tx.openPlayGameSeat.findFirst({
      where: { participantId: participant.id, game: { status: "playing" } },
      select: { id: true },
    });
    if (playing) return;

    const last = await tx.openPlayQueueEntry.findFirst({
      where: { sessionId: participant.sessionId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    await tx.openPlayQueueEntry.create({
      data: {
        sessionId: participant.sessionId,
        participantId: participant.id,
        position: (last?.position ?? 0) + 1,
      },
    });
  });

  return loadBoard(participant.sessionId);
}

async function deactivateParticipant(participantId: string, status: "no_show" | "left_session") {
  const participant = await loadParticipantOrThrow(participantId);
  if (await isOnActiveGame(participantId)) {
    throw new ConflictError("End the active game before removing this player");
  }

  await prisma.$transaction(async (tx) => {
    await tx.openPlayParticipant.update({ where: { id: participant.id }, data: { status } });
    await tx.openPlayQueueEntry.deleteMany({
      where: { sessionId: participant.sessionId, participantId: participant.id },
    });
    const remaining = await tx.openPlayQueueEntry.findMany({
      where: { sessionId: participant.sessionId },
      orderBy: { position: "asc" },
      select: { participantId: true },
    });
    await writeQueue(
      tx,
      participant.sessionId,
      remaining.map((entry) => entry.participantId),
    );
  });

  return loadBoard(participant.sessionId);
}

export function markParticipantNoShow(participantId: string) {
  return deactivateParticipant(participantId, "no_show");
}

export function markParticipantLeftSession(participantId: string) {
  return deactivateParticipant(participantId, "left_session");
}

async function loadCourtOrThrow(key: OpenPlayLiveSessionKey, courtId: string) {
  const session = await ensureSession(key);
  const court = await prisma.openPlayCourt.findUnique({
    where: { sessionId_courtId: { sessionId: session.id, courtId } },
    select: { id: true, state: true },
  });
  if (!court) throw new NotFoundError("Court not found for this session");
  return { session, court };
}

export async function setCourtUnavailable(key: OpenPlayLiveSessionKey, courtId: string) {
  const { session, court } = await loadCourtOrThrow(key, courtId);
  if (court.state === "playing") {
    throw new ConflictError("End the active game before marking the court unavailable");
  }
  await prisma.openPlayCourt.update({ where: { id: court.id }, data: { state: "unavailable" } });
  return loadBoard(session.id);
}

export async function setCourtAvailable(key: OpenPlayLiveSessionKey, courtId: string) {
  const { session, court } = await loadCourtOrThrow(key, courtId);
  if (court.state === "playing") {
    throw new ConflictError("Court has an active game");
  }
  await prisma.openPlayCourt.update({ where: { id: court.id }, data: { state: "available" } });
  return loadBoard(session.id);
}

/** Staff assign: put four checked-in players on an open court and start the game. */
export async function startOpenPlayLiveGame(courtId: string, body: StartOpenPlayLiveGameBody) {
  const key = { date: body.date, slotId: body.slotId };
  const { session, court } = await loadCourtOrThrow(key, courtId);
  if (session.status !== "live") {
    throw new ConflictError("Games can only start while the session is live");
  }
  if (court.state !== "available" && court.state !== "ready" && court.state !== "game_over") {
    throw new ConflictError("Court is not open for a new game");
  }

  const participantIds = [...new Set(body.participantIds)];
  if (participantIds.length !== OPEN_PLAY_GAME_SEATS) {
    throw new ConflictError("Four distinct players are required");
  }

  const participants = await prisma.openPlayParticipant.findMany({
    where: { id: { in: participantIds }, sessionId: session.id, status: "checked_in" },
    select: { id: true },
  });
  if (participants.length !== OPEN_PLAY_GAME_SEATS) {
    throw new ConflictError("All four players must be checked in for this session");
  }

  const busy = await prisma.openPlayGameSeat.findFirst({
    where: { participantId: { in: participantIds }, game: { status: "playing" } },
    select: { id: true },
  });
  if (busy) {
    throw new ConflictError("A selected player is already on an active game");
  }

  await prisma.$transaction(async (tx) => {
    const claimed = await tx.openPlayCourt.updateMany({
      where: { id: court.id, state: court.state },
      data: { state: "playing" },
    });
    if (claimed.count !== 1) {
      throw new ConflictError("Court state changed, retry");
    }
    await startGameOnCourt(tx, session.id, court.id, participantIds);
    await tx.openPlayQueueEntry.deleteMany({
      where: { sessionId: session.id, participantId: { in: participantIds } },
    });
    const remaining = await tx.openPlayQueueEntry.findMany({
      where: { sessionId: session.id },
      orderBy: { position: "asc" },
      select: { participantId: true },
    });
    await writeQueue(
      tx,
      session.id,
      remaining.map((entry) => entry.participantId),
    );
  });

  return loadBoard(session.id);
}

export type EndGameActor = {
  role: "player" | "staff";
  authUser?: AuthUser | undefined;
};

/**
 * End a game and rotate the court. Concurrent calls are idempotent: only the
 * request that flips `playing` → `completed` runs rotation.
 */
export async function endOpenPlayLiveGame(gameId: string, actor: EndGameActor) {
  if (actor.role === "player" && !actor.authUser) {
    throw new UnauthorizedError();
  }

  const game = await prisma.openPlayGame.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      sessionId: true,
      courtRowId: true,
      status: true,
      seats: {
        orderBy: { seatIndex: "asc" },
        select: {
          participantId: true,
          participant: { select: { userId: true, email: true } },
        },
      },
    },
  });
  if (!game) throw new NotFoundError("Game not found");

  if (actor.role === "player") {
    const authUser = actor.authUser!;
    const email = normalizeEmail(authUser.email);
    const onGame = game.seats.some(
      (seat) =>
        seat.participant.userId === authUser.id || normalizeEmail(seat.participant.email) === email,
    );
    if (!onGame) {
      throw new ForbiddenError("Only players on this game can end it");
    }
  }

  await prisma.$transaction(async (tx) => {
    const closed = await tx.openPlayGame.updateMany({
      where: { id: game.id, status: "playing" },
      data: {
        status: "completed",
        endedAt: new Date(),
        endedByUserId: actor.authUser?.id ?? null,
        endedByRole: actor.role,
      },
    });
    // Already ended by a concurrent request — do not rotate twice.
    if (closed.count !== 1) return;

    const [court, waitingRows, activeFinishers] = await Promise.all([
      tx.openPlayCourt.findUnique({
        where: { id: game.courtRowId },
        select: { id: true, state: true },
      }),
      tx.openPlayQueueEntry.findMany({
        where: { sessionId: game.sessionId },
        orderBy: { position: "asc" },
        select: { participantId: true },
      }),
      tx.openPlayParticipant.findMany({
        where: {
          id: { in: game.seats.map((seat) => seat.participantId) },
          status: "checked_in",
        },
        select: { id: true },
      }),
    ]);

    const stillPlaying = new Set(activeFinishers.map((participant) => participant.id));
    const { assigned, queue } = rotateOnGameEnd({
      waiting: waitingRows.map((entry) => entry.participantId),
      finishers: game.seats
        .map((seat) => seat.participantId)
        .filter((participantId) => stillPlaying.has(participantId)),
      courtUsable: court?.state !== "unavailable",
    });

    if (assigned) {
      await startGameOnCourt(tx, game.sessionId, game.courtRowId, assigned);
    } else if (court && court.state !== "unavailable") {
      await tx.openPlayCourt.update({ where: { id: court.id }, data: { state: "available" } });
    }

    await writeQueue(tx, game.sessionId, queue);
  });

  return loadBoard(game.sessionId, actor.authUser);
}
