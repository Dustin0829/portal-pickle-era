import { z } from "zod";
import { paginatedQuerySchema } from "../../lib/pagination.schema.js";

export const exampleSchema = z.object({
  id: z.string(),
  label: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const exampleParamsSchema = z.object({
  id: z.string().min(1),
});

export const listExamplesQuerySchema = paginatedQuerySchema.extend({
  sort: z.enum(["createdAt", "label"]).optional(),
  search: z.string().trim().min(2).max(100).optional(),
});

export const createExampleBodySchema = z
  .object({
    label: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

export type ExampleDto = z.infer<typeof exampleSchema>;
export type ListExamplesQuery = z.infer<typeof listExamplesQuerySchema>;
export type CreateExampleBody = z.infer<typeof createExampleBodySchema>;
export type ExampleParams = z.infer<typeof exampleParamsSchema>;
