import { z } from "zod";
import { nonEmptyString } from "@/api/schema/primitives.schema";

export const exampleSchema = z.object({
  id: z.string(),
  label: z.string().nullable(),
  createdAt: z.string(),
});

export const createExampleFormSchema = z
  .object({
    label: nonEmptyString.max(120, "Label must be 120 characters or fewer"),
  })
  .strict();

export type Example = z.infer<typeof exampleSchema>;
export type CreateExampleFormValues = z.infer<typeof createExampleFormSchema>;
