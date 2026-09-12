import { z } from "zod";

export const paginatedQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().trim().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().trim().optional(),
  })
  .strict();

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  current_page: z.number().int().positive(),
  limit: z.number().int().positive(),
  items_per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  total_items: z.number().int().nonnegative(),
  total_pages: z.number().int().positive(),
});

export function paginatedItemsSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({ items: z.array(itemSchema) });
}

export type PaginatedQuery = z.infer<typeof paginatedQuerySchema>;
