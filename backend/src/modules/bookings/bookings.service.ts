import { prisma } from "../../app/prisma.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../lib/errors.js";
import { buildPaginationMeta, pageToOffset, parseSortField } from "../../lib/pagination.js";
import { createPresignedDownload } from "../../lib/storage/s3.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { upsertWaitlistEntry } from "../waitlist/waitlist.service.js";
import type { AuthUser } from "../auth/auth.constants.js";
import { toUserDto, userPublicSelect } from "../auth/auth.mapper.js";
import {
  bookingOccupancySelect,
  bookingPublicSelect,
  isBeforeOpeningDate,
  normalizeBookingEmail,
  normalizeSlotIds,
  planFromApi,
  toBookingDto,
  toOccupancyItem,
} from "./bookings.mapper.js";
import {
  OPENING_DATE,
  OPEN_PLAY_CAPACITY,
  type CreateAdminBookingBody,
  type CreatePublicBookingBody,
  type ListBookingsQuery,
  type ListUsersQuery,
  type OccupancyQuery,
  type OpenPlaySessionsQuery,
  type PatchBookingBody,
} from "./bookings.schema.js";

const bookingSortFields = ["createdAt", "date"] as const;

export { OPEN_PLAY_CAPACITY };

/** True when open-play uses shared seat capacity (not court exclusivity). */
export function usesOpenPlayCapacity(plan: "open_play" | "court" | "clinic") {
  return plan === "open_play";
}

/** Reject when booked seats already fill capacity (call inside a transaction). */
export function assertOpenPlayHasSeat(booked: number, slotId: string) {
  if (booked >= OPEN_PLAY_CAPACITY) {
    throw new ConflictError(
      `Open Play session ${slotId} is full (${OPEN_PLAY_CAPACITY}/${OPEN_PLAY_CAPACITY})`,
    );
  }
}

/** Aggregate pending/approved open-play rows into per-slot seat counts. */
export function aggregateOpenPlayCounts(rows: Array<{ slotIds: string[] }>) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const slotId of row.slotIds) {
      counts.set(slotId, (counts.get(slotId) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slotId, bookedCount]) => ({
      slotId,
      bookedCount,
      capacity: OPEN_PLAY_CAPACITY,
    }));
}

async function countOpenPlaySeats(
  tx: Prisma.TransactionClient,
  date: string,
  slotId: string,
): Promise<number> {
  return tx.booking.count({
    where: {
      plan: "open_play",
      date,
      status: { in: ["pending", "approved"] },
      slotIds: { has: slotId },
    },
  });
}

export async function listOpenPlaySessions(query: OpenPlaySessionsQuery) {
  const rows = await prisma.booking.findMany({
    where: {
      plan: "open_play",
      date: query.date,
      status: { in: ["pending", "approved"] },
    },
    select: { slotIds: true },
  });

  return aggregateOpenPlayCounts(rows);
}

export async function createPublicBooking(body: CreatePublicBookingBody, authUser?: AuthUser) {
  if (body.plan === "court" && isBeforeOpeningDate(body.date, OPENING_DATE)) {
    throw new ValidationError(`Court bookings open on ${OPENING_DATE}`);
  }

  const email = normalizeBookingEmail(authUser?.email || body.email);
  const name = body.name.trim() || authUser?.name || "";
  const slotIds = normalizeSlotIds(body.slotIds);
  if (slotIds.length === 0) {
    throw new ValidationError("At least one slot is required");
  }

  const booking = await createBookingRow({
    plan: planFromApi(body.plan),
    date: body.date,
    courtId: body.courtId,
    slotIds,
    name,
    email,
    userId: authUser?.id ?? null,
    referenceId: body.referenceId?.trim() || "",
    receiptName: body.receiptName?.trim() || null,
    receiptKey: body.receiptKey?.trim() || null,
    receiptMimeType: body.receiptMimeType?.trim() || null,
    status: "pending",
  });

  if (email) {
    try {
      await upsertWaitlistEntry({
        name,
        email,
        source: "booking",
      });
    } catch {
      // Soft-fail: booking is primary.
    }
  }

  return toBookingDto(booking);
}

export async function createAdminBooking(body: CreateAdminBookingBody) {
  const email = normalizeBookingEmail(body.email);
  const slotIds = normalizeSlotIds(body.slotIds);
  if (slotIds.length === 0) {
    throw new ValidationError("At least one slot is required");
  }

  const booking = await createBookingRow({
    plan: planFromApi(body.plan),
    date: body.date,
    courtId: body.courtId,
    slotIds,
    name: body.name.trim(),
    email,
    userId: null,
    referenceId: body.referenceId?.trim() || "WALK-IN",
    receiptName: body.receiptName?.trim() || "Walk-in / cash",
    receiptKey: body.receiptKey?.trim() || null,
    receiptMimeType: body.receiptMimeType?.trim() || null,
    status: "approved",
  });

  return toBookingDto(booking);
}

export async function listOccupancy(query: OccupancyQuery) {
  const from = query.date ?? query.from;
  const to = query.date ?? query.to;
  if (!from || !to) {
    throw new ValidationError("Provide date or from and to");
  }

  const rows = await prisma.booking.findMany({
    where: {
      date: { gte: from, lte: to },
      status: { in: ["pending", "approved"] },
    },
    select: bookingOccupancySelect,
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toOccupancyItem);
}

export async function listMyBookings(authUser: AuthUser | undefined) {
  if (!authUser) {
    throw new UnauthorizedError();
  }

  const rows = await prisma.booking.findMany({
    where: {
      OR: [{ userId: authUser.id }, { email: normalizeBookingEmail(authUser.email) }],
    },
    select: bookingPublicSelect,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toBookingDto);
}

export async function listAdminBookings(query: ListBookingsQuery) {
  const sortField = parseSortField(query.sort, bookingSortFields, "createdAt");
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: "insensitive" as const } },
            { name: { contains: query.search, mode: "insensitive" as const } },
            { referenceId: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      select: bookingPublicSelect,
      orderBy: { [sortField]: query.order },
      skip: pageToOffset(query.page, query.limit),
      take: query.limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: rows.map(toBookingDto),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function patchBookingStatus(id: string, body: PatchBookingBody) {
  const existing = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!existing) {
    throw new NotFoundError("Booking not found");
  }

  const row = await prisma.booking.update({
    where: { id },
    data: { status: body.status },
    select: bookingPublicSelect,
  });
  return toBookingDto(row);
}

export async function getBookingReceiptUrl(id: string) {
  const row = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, receiptKey: true },
  });
  if (!row) {
    throw new NotFoundError("Booking not found");
  }
  if (!row.receiptKey) {
    throw new NotFoundError("Receipt not found");
  }

  return createPresignedDownload({ key: row.receiptKey });
}

export async function listAdminUsers(query: ListUsersQuery) {
  const where = { role: query.role };
  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userPublicSelect,
      orderBy: { createdAt: query.order },
      skip: pageToOffset(query.page, query.limit),
      take: query.limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: rows.map(toUserDto),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

async function createBookingRow(input: {
  plan: ReturnType<typeof planFromApi>;
  date: string;
  courtId: string;
  slotIds: string[];
  name: string;
  email: string;
  userId: string | null;
  referenceId: string;
  receiptName: string | null;
  receiptKey: string | null;
  receiptMimeType: string | null;
  status: "pending" | "approved";
}) {
  return prisma.$transaction(async (tx) => {
    if (usesOpenPlayCapacity(input.plan)) {
      for (const slotId of input.slotIds) {
        const booked = await countOpenPlaySeats(tx, input.date, slotId);
        assertOpenPlayHasSeat(booked, slotId);
      }
    } else {
      const blockers = await tx.booking.findMany({
        where: {
          date: input.date,
          courtId: input.courtId,
          status: { in: ["pending", "approved"] },
          slotIds: { hasSome: input.slotIds },
        },
        select: { id: true },
        take: 1,
      });

      if (blockers.length > 0) {
        throw new ConflictError("One or more slots are already booked for this court and date");
      }
    }

    return tx.booking.create({
      data: input,
      select: bookingPublicSelect,
    });
  });
}
