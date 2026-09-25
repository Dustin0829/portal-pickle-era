import type { Prisma } from "../../generated/prisma/client.js";
import { OPEN_PLAY_CAPACITY } from "../bookings/bookings.schema.js";
import { OPEN_PLAY_FIFO_COURTS } from "../bookings/open-play-fifo.js";
import type { AuthUser } from "../auth/auth.constants.js";
import type { OpenPlayLiveBoard, OpenPlayLiveMyStatus } from "./open-play-live.schema.js";

export const openPlayLiveBoardSelect = {
  id: true,
  date: true,
  slotId: true,
  status: true,
  courts: {
    select: {
      id: true,
      courtId: true,
      courtLabel: true,
      state: true,
      games: {
        where: { status: "playing" as const },
        select: {
          id: true,
          startedAt: true,
          seats: {
            select: {
              participantId: true,
              side: true,
              seatIndex: true,
              participant: { select: { name: true } },
            },
            orderBy: { seatIndex: "asc" as const },
          },
        },
      },
    },
  },
  participants: {
    select: {
      id: true,
      bookingId: true,
      name: true,
      email: true,
      userId: true,
      status: true,
      checkedInAt: true,
    },
  },
  queue: {
    select: {
      participantId: true,
      position: true,
      participant: { select: { name: true } },
    },
    orderBy: { position: "asc" as const },
  },
} as const satisfies Prisma.OpenPlaySessionSelect;

export type OpenPlayLiveBoardRow = Prisma.OpenPlaySessionGetPayload<{
  select: typeof openPlayLiveBoardSelect;
}>;

const courtOrder = new Map<string, number>(
  OPEN_PLAY_FIFO_COURTS.map((court, index) => [court.id, index]),
);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findCallerParticipant(row: OpenPlayLiveBoardRow, authUser: AuthUser | undefined) {
  if (!authUser) return undefined;
  const email = normalizeEmail(authUser.email);
  return row.participants.find(
    (participant) =>
      participant.userId === authUser.id || normalizeEmail(participant.email) === email,
  );
}

export function toOpenPlayLiveBoard(
  row: OpenPlayLiveBoardRow,
  authUser?: AuthUser,
): OpenPlayLiveBoard {
  const courts = [...row.courts]
    .sort((a, b) => (courtOrder.get(a.courtId) ?? 99) - (courtOrder.get(b.courtId) ?? 99))
    .map((court) => {
      const game = court.games[0];
      return {
        courtId: court.courtId,
        courtLabel: court.courtLabel,
        state: court.state,
        game: game
          ? {
              id: game.id,
              startedAt: game.startedAt.toISOString(),
              players: game.seats.map((seat) => ({
                participantId: seat.participantId,
                name: seat.participant.name,
                side: seat.side === "B" ? ("B" as const) : ("A" as const),
                seatIndex: seat.seatIndex,
              })),
            }
          : null,
      };
    });

  const upNext = row.queue.map((entry, index) => ({
    participantId: entry.participantId,
    name: entry.participant.name,
    position: index + 1,
  }));

  return {
    session: {
      id: row.id,
      date: row.date,
      slotId: row.slotId,
      status: row.status,
    },
    courts,
    upNext,
    participants: row.participants.map((participant) => ({
      id: participant.id,
      bookingId: participant.bookingId,
      name: participant.name,
      status: participant.status,
      checkedInAt: participant.checkedInAt?.toISOString() ?? null,
    })),
    checkedInCount: row.participants.filter((participant) => participant.status === "checked_in")
      .length,
    capacity: OPEN_PLAY_CAPACITY,
    myStatus: buildMyStatus(row, courts, upNext, authUser),
  };
}

function buildMyStatus(
  row: OpenPlayLiveBoardRow,
  courts: OpenPlayLiveBoard["courts"],
  upNext: OpenPlayLiveBoard["upNext"],
  authUser: AuthUser | undefined,
): OpenPlayLiveMyStatus | null {
  const participant = findCallerParticipant(row, authUser);
  if (!participant) return null;

  for (const court of courts) {
    const seat = court.game?.players.find((player) => player.participantId === participant.id);
    if (court.game && seat) {
      return {
        participantId: participant.id,
        participantStatus: participant.status,
        state: "playing",
        queuePosition: null,
        courtId: court.courtId,
        courtLabel: court.courtLabel,
        side: seat.side,
        gameId: court.game.id,
      };
    }
  }

  const queued = upNext.find((entry) => entry.participantId === participant.id);
  const state =
    participant.status === "checked_in"
      ? ("waiting" as const)
      : participant.status === "booked"
        ? ("not_checked_in" as const)
        : ("inactive" as const);

  return {
    participantId: participant.id,
    participantStatus: participant.status,
    state,
    queuePosition: queued?.position ?? null,
    courtId: null,
    courtLabel: null,
    side: null,
    gameId: null,
  };
}
