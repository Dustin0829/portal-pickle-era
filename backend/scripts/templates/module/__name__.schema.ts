import { z } from "zod";

export const {{camelName}}ParamsSchema = z.object({
  id: z.string().min(1),
});

export const create{{Name}}BodySchema = z
  .object({
    label: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

export type {{Name}}Params = z.infer<typeof {{camelName}}ParamsSchema>;
export type Create{{Name}}Body = z.infer<typeof create{{Name}}BodySchema>;
