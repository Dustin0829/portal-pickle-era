import { prisma } from "../../app/prisma.js";
import { buildPaginationMeta, pageToOffset, parseSortField } from "../../lib/pagination.js";
import { resolveWaitlistImageUrl } from "./waitlist.images.js";
import {
  matchUserImageKey,
  normalizeWaitlistEmail,
  toWaitlistEntryDto,
  waitlistPublicSelect,
  type WaitlistPublicRow,
} from "./waitlist.mapper.js";
import type { CreateWaitlistBody, ListWaitlistQuery, WaitlistEntryDto } from "./waitlist.schema.js";

const allowedSortFields = ["createdAt", "email"] as const;

export async function upsertWaitlistEntry(body: CreateWaitlistBody) {
  const email = normalizeWaitlistEmail(body.email);
  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() || null;
  const source = body.source;

  const row = await prisma.waitlistEntry.upsert({
    where: { email },
    create: {
      email,
      name,
      phone,
      source,
    },
    update: {
      ...(body.name !== undefined ? { name } : {}),
      ...(body.phone !== undefined ? { phone } : {}),
      source,
    },
    select: waitlistPublicSelect,
  });

  return toWaitlistEntryDto(row, null);
}

export async function listWaitlistEntries(query: ListWaitlistQuery) {
  const sortField = parseSortField(query.sort, allowedSortFields, "createdAt");
  const where = query.search
    ? {
        email: {
          contains: query.search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.waitlistEntry.findMany({
      where,
      select: waitlistPublicSelect,
      orderBy: { [sortField]: query.order },
      skip: pageToOffset(query.page, query.limit),
      take: query.limit,
    }),
    prisma.waitlistEntry.count({ where }),
  ]);

  return {
    items: await enrichWaitlistRowsWithImages(rows),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

/** Batch-load users by email and attach resolved image URLs (null on miss/failure). */
export async function enrichWaitlistRowsWithImages(
  rows: WaitlistPublicRow[],
): Promise<WaitlistEntryDto[]> {
  if (rows.length === 0) return [];

  const emails = [...new Set(rows.map((r) => normalizeWaitlistEmail(r.email)))];
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true, image: true },
  });

  return Promise.all(
    rows.map(async (row) => {
      const imageKey = matchUserImageKey(row.email, users);
      const imageUrl = await resolveWaitlistImageUrl(imageKey);
      return toWaitlistEntryDto(row, imageUrl);
    }),
  );
}
