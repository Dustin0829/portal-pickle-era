import { prisma } from "../../app/prisma.js";
import { logger } from "../../app/logger.js";
import {
  ensureStudentCredentialUser,
  planInviteCredentialsEmail,
} from "../../lib/auth/create-student-user.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../lib/errors.js";
import { buildPaginationMeta, pageToOffset, parseSortField } from "../../lib/pagination.js";
import {
  isResendConfigured,
  sendBookingApprovedEmail,
  sendBookingPaymentReceivedEmail,
  sendBookingRejectedEmail,
  sendPlayerInviteEmail,
} from "../../lib/resend/client.js";
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
  parseCourtSlots,
  planFromApi,
  toBookingDto,
  toOccupancyItems,
  totalCourtHours,
  unionSlotIds,
} from "./bookings.mapper.js";
import {
  OPENING_DATE,
  OPEN_PLAY_CAPACITY,
  type CourtSlot,
  type CreateAdminBookingBody,
  type CreatePublicBookingBody,
  type ListBookingsQuery,
  type ListUsersQuery,
  type OccupancyQuery,
  type OpenPlaySessionsQuery,
  type PatchBookingBody,
} from "./bookings.schema.js";

import { applyWalletDelta, findWalletLedgerByRef } from "../wallet/wallet.service.js";
import { bookingApproveNeedsDebit, bookingRejectNeedsRefund } from "./bookings.wallet-hold.js";
import { coveredHoursForOpenPlaySlotIds, hourSetsOverlap } from "./open-play-hours.js";
import {
  getOpenPlaySessions,
  getPlanPricePesos,
} from "../facility-settings/facility-settings.service.js";

const bookingSortFields = ["createdAt", "date"] as const;

/** Default unit prices in pesos (match app PLAN_META). */
export const DEFAULT_PLAN_PRICE_PESOS: Record<"court" | "open_play" | "clinic", number> = {
  court: 300,
  open_play: 250,
  clinic: 500,
};

export function bookingTotalCents(
  plan: "court" | "open_play" | "clinic",
  slotCount: number,
  unitPricePesos?: number,
): number {
  const pesos = unitPricePesos ?? DEFAULT_PLAN_PRICE_PESOS[plan];
  return Math.round(pesos * 100) * Math.max(slotCount, 0);
}

export function clampWalletAppliedCents(input: {
  requested: number | undefined;
  balanceCents: number;
  totalCents: number;
}): number {
  if (input.requested === undefined || input.requested <= 0) return 0;
  return Math.min(input.requested, input.balanceCents, input.totalCents);
}

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
  const courtSlots = resolveCourtSlotsFromBody(body);
  if (courtSlots.length === 0) {
    throw new ValidationError("At least one court slot is required");
  }

  const plan = planFromApi(body.plan);
  const hourCount =
    plan === "open_play" ? unionSlotIds(courtSlots).length : totalCourtHours(courtSlots);
  const unitPricePesos =
    body.unitPricePesos ??
    (await getPlanPricePesos(plan).catch(() => DEFAULT_PLAN_PRICE_PESOS[plan]));
  const totalCents = bookingTotalCents(plan, hourCount, unitPricePesos);
  let walletAppliedCents = 0;
  if (authUser && body.walletAppliedCents !== undefined) {
    const wallet = await prisma.wallet.upsert({
      where: { userId: authUser.id },
      create: { userId: authUser.id, balanceCents: 0 },
      update: {},
      select: { balanceCents: true },
    });
    walletAppliedCents = clampWalletAppliedCents({
      requested: body.walletAppliedCents,
      balanceCents: wallet.balanceCents,
      totalCents,
    });
  }

  const remainingCents = totalCents - walletAppliedCents;
  if (remainingCents > 0 && !body.receiptKey?.trim()) {
    if (!body.referenceId?.trim() && !body.receiptName?.trim()) {
      throw new ValidationError("Add GCash reference or receipt for the remaining balance");
    }
  }

  const booking = await createBookingRow({
    plan,
    date: body.date,
    courtSlots,
    name,
    email,
    userId: authUser?.id ?? null,
    referenceId: body.referenceId?.trim() || "",
    receiptName: body.receiptName?.trim() || null,
    receiptKey: body.receiptKey?.trim() || null,
    receiptMimeType: body.receiptMimeType?.trim() || null,
    walletAppliedCents,
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

  const dto = toBookingDto(booking);

  const referenceId = body.referenceId?.trim();
  void sendBookingPaymentReceivedEmail({
    to: email,
    name,
    date: body.date,
    ...(referenceId ? { referenceId } : {}),
  }).then((result) => {
    if (!result.sent) {
      logger.info("booking_payment_received_email_skipped_or_failed", {
        bookingId: dto.id,
        reason: result.reason,
      });
    }
  });

  return dto;
}

export async function createAdminBooking(body: CreateAdminBookingBody) {
  const email = normalizeBookingEmail(body.email);
  const courtSlots = resolveCourtSlotsFromBody(body);
  if (courtSlots.length === 0) {
    throw new ValidationError("At least one court slot is required");
  }

  const booking = await createBookingRow({
    plan: planFromApi(body.plan),
    date: body.date,
    courtSlots,
    name: body.name.trim(),
    email,
    userId: null,
    referenceId: body.referenceId?.trim() || "WALK-IN",
    receiptName: body.receiptName?.trim() || "Walk-in / cash",
    receiptKey: body.receiptKey?.trim() || null,
    receiptMimeType: body.receiptMimeType?.trim() || null,
    walletAppliedCents: 0,
    status: "approved",
  });

  return toBookingDto(booking);
}

function resolveCourtSlotsFromBody(body: CreatePublicBookingBody): CourtSlot[] {
  if (body.courtSlots != null && body.courtSlots.length > 0) {
    return parseCourtSlots(body.courtSlots);
  }
  if (body.courtId != null && body.slotIds != null) {
    return parseCourtSlots(null, {
      courtId: body.courtId,
      slotIds: body.slotIds,
    });
  }
  return [];
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
  return rows.flatMap(toOccupancyItems);
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
    select: {
      id: true,
      status: true,
      email: true,
      name: true,
      date: true,
      referenceId: true,
      userId: true,
      walletAppliedCents: true,
    },
  });
  if (!existing) {
    throw new NotFoundError("Booking not found");
  }

  const statusEmailTo = normalizeBookingEmail(existing.email);
  const statusEmailBase = {
    to: statusEmailTo,
    name: existing.name,
    date: existing.date,
    ...(existing.referenceId?.trim() ? { referenceId: existing.referenceId.trim() } : {}),
  };

  if (body.status === "rejected") {
    const row = await prisma.$transaction(async (tx) => {
      const priorDebit = await findWalletLedgerByRef(tx, {
        type: "booking_debit",
        referenceType: "booking",
        referenceId: id,
      });
      const priorRefund = await findWalletLedgerByRef(tx, {
        type: "booking_refund",
        referenceType: "booking",
        referenceId: id,
      });

      if (
        bookingRejectNeedsRefund({
          hasPriorDebit: Boolean(priorDebit),
          hasPriorRefund: Boolean(priorRefund),
          walletAppliedCents: existing.walletAppliedCents,
        }) &&
        priorDebit
      ) {
        await applyWalletDelta(tx, {
          userId: priorDebit.userId,
          amountCents: existing.walletAppliedCents,
          type: "booking_refund",
          referenceType: "booking",
          referenceId: id,
        });
      }

      return tx.booking.update({
        where: { id },
        data: { status: "rejected" },
        select: bookingPublicSelect,
      });
    });

    const rejectedResult = await sendBookingRejectedEmail(statusEmailBase);
    if (!rejectedResult.sent) {
      logger.info("booking_rejected_email_skipped_or_failed", {
        bookingId: id,
        reason: rejectedResult.reason,
      });
    }

    return toBookingDto(row);
  }

  let createdNewUser = false;
  let tempPassword: string | null = null;

  const row = await prisma.$transaction(async (tx) => {
    const ensured = await ensureStudentCredentialUser(
      { name: existing.name, email: existing.email },
      tx,
    );
    createdNewUser = ensured.createdNewUser;
    tempPassword = ensured.tempPassword;

    const priorDebit = await findWalletLedgerByRef(tx, {
      type: "booking_debit",
      referenceType: "booking",
      referenceId: id,
    });
    if (
      bookingApproveNeedsDebit({
        hasPriorDebit: Boolean(priorDebit),
        walletAppliedCents: existing.walletAppliedCents,
      })
    ) {
      await applyWalletDelta(tx, {
        userId: ensured.user.id,
        amountCents: -existing.walletAppliedCents,
        type: "booking_debit",
        referenceType: "booking",
        referenceId: id,
        insufficientFundsMessage: "Insufficient wallet balance to apply credits to this booking",
      });
    }

    return tx.booking.update({
      where: { id },
      data: {
        status: "approved",
        userId: ensured.user.id,
      },
      select: bookingPublicSelect,
    });
  });

  const dto = toBookingDto(row);

  const approvedResult = await sendBookingApprovedEmail(statusEmailBase);
  if (!approvedResult.sent) {
    logger.info("booking_approved_email_skipped_or_failed", {
      bookingId: id,
      reason: approvedResult.reason,
    });
  }

  const plan = planInviteCredentialsEmail({
    createdNewUser,
    resendConfigured: isResendConfigured(),
  });

  if (plan === "skip_existing_user" || !tempPassword) {
    return dto;
  }

  if (plan === "skip_not_configured") {
    logger.info("invite_email_skipped", {
      bookingId: id,
      reason: "not_configured",
    });
    return {
      ...dto,
      inviteEmailWarning: "Invite email skipped: RESEND_API_KEY or EMAIL_FROM is not configured",
    };
  }

  const emailResult = await sendPlayerInviteEmail({
    to: statusEmailTo,
    tempPassword,
  });

  if (!emailResult.sent) {
    logger.warn("invite_email_failed_after_approve", {
      bookingId: id,
      reason: emailResult.reason,
    });
    return {
      ...dto,
      inviteEmailWarning: emailResult.message,
    };
  }

  return dto;
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
    items: await Promise.all(rows.map(async (row) => toUserDto(row, null))),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

/** Open Play → court/clinic only (one-way). Court occupancy never blocks Open Play. */
async function assertNoCrossPlanConflict(
  tx: Prisma.TransactionClient,
  input: {
    plan: "open_play" | "court" | "clinic";
    date: string;
    slotIds: string[];
  },
) {
  if (input.plan === "open_play") return;

  const sessions = await getOpenPlaySessions().catch(() => undefined);
  const openPlayRows = await tx.booking.findMany({
    where: {
      date: input.date,
      plan: "open_play",
      status: { in: ["pending", "approved"] },
    },
    select: { slotIds: true },
  });
  for (const row of openPlayRows) {
    const covered = coveredHoursForOpenPlaySlotIds(row.slotIds, sessions);
    if (hourSetsOverlap(covered, input.slotIds)) {
      throw new ConflictError(
        "One or more hours overlap an Open Play session already booked for that date",
      );
    }
  }
}

async function createBookingRow(input: {
  plan: ReturnType<typeof planFromApi>;
  date: string;
  courtSlots: CourtSlot[];
  name: string;
  email: string;
  userId: string | null;
  referenceId: string;
  receiptName: string | null;
  receiptKey: string | null;
  receiptMimeType: string | null;
  walletAppliedCents: number;
  status: "pending" | "approved";
}) {
  const courtSlots = parseCourtSlots(input.courtSlots);
  if (courtSlots.length === 0) {
    throw new ValidationError("At least one court slot is required");
  }
  const primaryCourtId = courtSlots[0]!.courtId;
  const allSlotIds = unionSlotIds(courtSlots);

  return prisma.$transaction(async (tx) => {
    await assertNoCrossPlanConflict(tx, {
      plan: input.plan,
      date: input.date,
      slotIds: allSlotIds,
    });

    if (usesOpenPlayCapacity(input.plan)) {
      for (const slotId of allSlotIds) {
        const booked = await countOpenPlaySeats(tx, input.date, slotId);
        assertOpenPlayHasSeat(booked, slotId);
      }
    } else {
      const existingRows = await tx.booking.findMany({
        where: {
          date: input.date,
          plan: { in: ["court", "clinic"] },
          status: { in: ["pending", "approved"] },
        },
        select: {
          id: true,
          courtId: true,
          slotIds: true,
          courtSlots: true,
        },
      });

      for (const segment of courtSlots) {
        const conflict = existingRows.some((row) => {
          const segments = parseCourtSlots(row.courtSlots, {
            courtId: row.courtId,
            slotIds: row.slotIds,
          });
          return segments.some(
            (existing) =>
              existing.courtId === segment.courtId &&
              existing.slotIds.some((id) => segment.slotIds.includes(id)),
          );
        });
        if (conflict) {
          throw new ConflictError("One or more slots are already booked for this court and date");
        }
      }
    }

    const booking = await tx.booking.create({
      data: {
        plan: input.plan,
        date: input.date,
        courtId: primaryCourtId,
        slotIds: allSlotIds,
        courtSlots,
        name: input.name,
        email: input.email,
        userId: input.userId,
        referenceId: input.referenceId,
        receiptName: input.receiptName,
        receiptKey: input.receiptKey,
        receiptMimeType: input.receiptMimeType,
        walletAppliedCents: input.walletAppliedCents,
        status: input.status,
      },
      select: bookingPublicSelect,
    });

    if (input.userId && input.walletAppliedCents > 0) {
      await applyWalletDelta(tx, {
        userId: input.userId,
        amountCents: -input.walletAppliedCents,
        type: "booking_debit",
        referenceType: "booking",
        referenceId: booking.id,
        insufficientFundsMessage: "Insufficient wallet balance to apply credits to this booking",
      });
    }

    return booking;
  });
}
