import type { BookingPlan, BookingStatus, Prisma } from "../../generated/prisma/client.js";
import type { BookingDto, BookingOccupancyItem, CourtSlot } from "./bookings.schema.js";
import { courtIdSchema, courtSlotSchema } from "./bookings.schema.js";

export const bookingPublicSelect = {
  id: true,
  plan: true,
  date: true,
  courtId: true,
  slotIds: true,
  courtSlots: true,
  name: true,
  email: true,
  userId: true,
  referenceId: true,
  receiptName: true,
  receiptKey: true,
  receiptMimeType: true,
  walletAppliedCents: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.BookingSelect;

export const bookingOccupancySelect = {
  id: true,
  plan: true,
  date: true,
  courtId: true,
  slotIds: true,
  courtSlots: true,
  status: true,
} as const satisfies Prisma.BookingSelect;

export type BookingPublicRow = Prisma.BookingGetPayload<{
  select: typeof bookingPublicSelect;
}>;

export type BookingOccupancyRow = Prisma.BookingGetPayload<{
  select: typeof bookingOccupancySelect;
}>;

export function planToApi(plan: BookingPlan): BookingDto["plan"] {
  if (plan === "open_play") return "open-play";
  return plan;
}

export function planFromApi(plan: BookingDto["plan"]): BookingPlan {
  if (plan === "open-play") return "open_play";
  return plan;
}

export function normalizeSlotIds(slotIds: string[]): string[] {
  return [...new Set(slotIds.map((id) => id.trim()).filter(Boolean))].sort();
}

/** Normalize / validate courtSlots JSON from DB or request. */
export function parseCourtSlots(
  raw: unknown,
  fallback?: { courtId: string; slotIds: string[] },
): CourtSlot[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const parsed: CourtSlot[] = [];
    const seen = new Set<string>();
    for (const entry of raw) {
      const result = courtSlotSchema.safeParse({
        courtId: (entry as { courtId?: string })?.courtId,
        slotIds: normalizeSlotIds(
          Array.isArray((entry as { slotIds?: string[] })?.slotIds)
            ? (entry as { slotIds: string[] }).slotIds
            : [],
        ),
      });
      if (!result.success) continue;
      if (seen.has(result.data.courtId)) continue;
      seen.add(result.data.courtId);
      parsed.push(result.data);
    }
    if (parsed.length > 0) return parsed;
  }
  if (fallback && fallback.slotIds.length > 0) {
    const courtId = courtIdSchema.safeParse(fallback.courtId);
    if (courtId.success) {
      return [{ courtId: courtId.data, slotIds: normalizeSlotIds(fallback.slotIds) }];
    }
  }
  return [];
}

export function unionSlotIds(slots: CourtSlot[]): string[] {
  return normalizeSlotIds(slots.flatMap((s) => s.slotIds));
}

export function totalCourtHours(slots: CourtSlot[]): number {
  return slots.reduce((sum, s) => sum + s.slotIds.length, 0);
}

export function toBookingDto(row: BookingPublicRow): BookingDto {
  const courtSlots = parseCourtSlots(row.courtSlots, {
    courtId: row.courtId,
    slotIds: row.slotIds,
  });
  const primary = courtSlots[0];
  return {
    id: row.id,
    plan: planToApi(row.plan),
    date: row.date,
    courtId: primary?.courtId ?? row.courtId,
    slotIds: courtSlots.length ? unionSlotIds(courtSlots) : row.slotIds,
    courtSlots:
      courtSlots.length > 0
        ? courtSlots
        : [{ courtId: row.courtId as CourtSlot["courtId"], slotIds: row.slotIds }],
    name: row.name,
    email: row.email,
    userId: row.userId,
    referenceId: row.referenceId,
    receiptName: row.receiptName,
    receiptKey: row.receiptKey,
    receiptMimeType: row.receiptMimeType,
    walletAppliedCents: row.walletAppliedCents,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Expand multi-court bookings into one occupancy item per court segment. */
export function toOccupancyItems(row: BookingOccupancyRow): BookingOccupancyItem[] {
  const courtSlots = parseCourtSlots(row.courtSlots, {
    courtId: row.courtId,
    slotIds: row.slotIds,
  });
  const status = row.status as "pending" | "approved";
  const plan = planToApi(row.plan);
  if (courtSlots.length === 0) {
    return [
      {
        id: row.id,
        plan,
        date: row.date,
        courtId: row.courtId,
        slotIds: row.slotIds,
        status,
      },
    ];
  }
  return courtSlots.map((segment) => ({
    id: row.id,
    plan,
    date: row.date,
    courtId: segment.courtId,
    slotIds: segment.slotIds,
    status,
  }));
}

/** @deprecated Prefer toOccupancyItems for multi-court. */
export function toOccupancyItem(row: BookingOccupancyRow): BookingOccupancyItem {
  return toOccupancyItems(row)[0]!;
}

export function normalizeBookingEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isBeforeOpeningDate(date: string, openingDate: string): boolean {
  return date < openingDate;
}

/** Pure helper for tests — overlapping if any shared slot id. */
export function slotsOverlap(a: string[], b: string[]): boolean {
  const set = new Set(a);
  return b.some((id) => set.has(id));
}

export type BlockingStatus = Extract<BookingStatus, "pending" | "approved">;
