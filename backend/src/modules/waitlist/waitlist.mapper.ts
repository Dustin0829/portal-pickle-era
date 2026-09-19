import type { Prisma } from "../../generated/prisma/client.js";
import type { WaitlistEntryDto } from "./waitlist.schema.js";

/** Public API fields only — must match `waitlistEntrySchema` */
export const waitlistPublicSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  source: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.WaitlistEntrySelect;

export type WaitlistPublicRow = Prisma.WaitlistEntryGetPayload<{
  select: typeof waitlistPublicSelect;
}>;

export function toWaitlistEntryDto(
  row: WaitlistPublicRow,
  imageUrl: string | null = null,
): WaitlistEntryDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    imageUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function normalizeWaitlistEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Case-insensitive email → stored profile image key (or null). */
export function matchUserImageKey(
  leadEmail: string,
  users: { email: string; image: string | null }[],
): string | null {
  const key = normalizeWaitlistEmail(leadEmail);
  const user = users.find((u) => normalizeWaitlistEmail(u.email) === key);
  return user?.image ?? null;
}
