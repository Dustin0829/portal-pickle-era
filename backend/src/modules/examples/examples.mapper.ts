import type { Prisma } from "../../generated/prisma/client.js";
import type { ExampleDto } from "./examples.schema.js";

/** Public API fields only — must match `exampleSchema` in examples.schema.ts */
export const examplePublicSelect = {
  id: true,
  label: true,
  createdAt: true,
} as const satisfies Prisma.ExampleSelect;

export type ExamplePublicRow = Prisma.ExampleGetPayload<{ select: typeof examplePublicSelect }>;

export function toExampleDto(row: ExamplePublicRow): ExampleDto {
  return {
    id: row.id,
    label: row.label,
    createdAt: row.createdAt.toISOString(),
  };
}
