import type { BookingPlan, BookingStatus, Prisma } from "../../generated/prisma/client.js";
import type { BookingDto, BookingOccupancyItem } from "./bookings.schema.js";

export const bookingPublicSelect = {
  id: true,
  plan: true,
  date: true,
  courtId: true,
  slotIds: true,
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

export function toBookingDto(row: BookingPublicRow): BookingDto {
  return {
    id: row.id,
    plan: planToApi(row.plan),
    date: row.date,
    courtId: row.courtId,
    slotIds: row.slotIds,
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

export function toOccupancyItem(row: BookingOccupancyRow): BookingOccupancyItem {
  return {
    id: row.id,
    plan: planToApi(row.plan),
    date: row.date,
    courtId: row.courtId,
    slotIds: row.slotIds,
    status: row.status as "pending" | "approved",
  };
}

export function normalizeSlotIds(slotIds: string[]): string[] {
  return [...new Set(slotIds.map((id) => id.trim()).filter(Boolean))].sort();
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
