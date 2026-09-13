import { prisma } from "../../app/prisma.js";
import { buildPaginationMeta, pageToOffset, parseSortField } from "../../lib/pagination.js";
import {
  normalizeWaitlistEmail,
  toWaitlistEntryDto,
  waitlistPublicSelect,
} from "./waitlist.mapper.js";
import type { CreateWaitlistBody, ListWaitlistQuery } from "./waitlist.schema.js";

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

  return toWaitlistEntryDto(row);
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
    items: rows.map(toWaitlistEntryDto),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}
