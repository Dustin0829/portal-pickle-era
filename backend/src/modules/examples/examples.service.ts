import { prisma } from "../../app/prisma.js";
import { writeAuditLog } from "../../lib/audit.js";
import { NotFoundError } from "../../lib/errors.js";
import { buildPaginationMeta, pageToOffset, parseSortField } from "../../lib/pagination.js";
import type { CreateExampleBody, ListExamplesQuery } from "./examples.schema.js";
import { examplePublicSelect, toExampleDto } from "./examples.mapper.js";
import { exampleQueue } from "./examples.queue.js";

const allowedSortFields = ["createdAt", "label"] as const;

export async function listExamples(query: ListExamplesQuery) {
  const sortField = parseSortField(query.sort, allowedSortFields, "createdAt");
  const where = query.search
    ? {
        label: {
          contains: query.search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.example.findMany({
      where,
      select: examplePublicSelect,
      orderBy: { [sortField]: query.order },
      skip: pageToOffset(query.page, query.limit),
      take: query.limit,
    }),
    prisma.example.count({ where }),
  ]);

  return {
    items: rows.map(toExampleDto),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function getExample(id: string) {
  const row = await prisma.example.findUnique({
    where: { id },
    select: examplePublicSelect,
  });
  if (!row) {
    throw new NotFoundError("Example not found");
  }

  return toExampleDto(row);
}

export async function createExample(body: CreateExampleBody) {
  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.example.create({
      data: body.label ? { label: body.label } : {},
      select: examplePublicSelect,
    });
    await writeAuditLog(tx, {
      actorId: null,
      action: "example.created",
      resource: `example:${created.id}`,
    });
    return created;
  });

  await exampleQueue.add("created", { exampleId: row.id });

  return toExampleDto(row);
}
