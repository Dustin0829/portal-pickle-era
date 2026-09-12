import { z } from "zod";

/** Trimmed non-empty string — use instead of repeating `z.string().trim().min(1)`. */
export const nonEmptyString = z
  .string()
  .trim()
  .min(1, "This field is required");

/** Timezone-aware ISO-8601 timestamp string from APIs. */
export const isoDate = z.string().datetime({ offset: true });

/** Positive integer IDs (coerces string form values / query params). */
export const positiveId = z.coerce.number().int().positive();

/** HTTPS-only URL — `z.string().url()` alone allows `http:`. */
export const safeUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => value.startsWith("https://"), "URL must use HTTPS");

/** Enum derived from a const object — stays in sync with source, no duplicated literals. */
export function enumFromObject<T extends Record<string, string>>(obj: T) {
  const values = Object.values(obj) as [T[keyof T], ...T[keyof T][]];
  return z.enum(values);
}

/** Client-side list query params when calling paginated endpoints. */
export const paginatedQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();

export type PaginatedQueryInput = z.infer<typeof paginatedQuerySchema>;

/** Matches backend `PaginationMeta` / `sendSuccess` top-level `meta`. */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  current_page: z.number().int().positive(),
  limit: z.number().int().positive(),
  items_per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  total_items: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
});

export type PaginationMetaParsed = z.infer<typeof paginationMetaSchema>;

/** Validates `{ items: T[] }` inside `data` for list responses. */
export function paginatedItemsSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
  });
}
