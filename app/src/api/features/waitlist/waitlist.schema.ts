import { z } from "zod";
import { nonEmptyString } from "@/api/schema/primitives.schema";

export const waitlistSourceSchema = z.enum([
  "join_club",
  "newsletter",
  "booking",
]);

export const waitlistEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  source: waitlistSourceSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createWaitlistFormSchema = z
  .object({
    name: z.string().trim().max(120).optional(),
    email: nonEmptyString.email("Enter a valid email address").max(254),
    phone: z.string().trim().max(40).optional(),
    source: waitlistSourceSchema.optional(),
  })
  .strict();

export type WaitlistEntry = z.infer<typeof waitlistEntrySchema>;
export type CreateWaitlistFormValues = z.infer<typeof createWaitlistFormSchema>;
