import { z } from "zod";
import { paginatedQuerySchema } from "../../lib/pagination.schema.js";

export const waitlistSourceSchema = z.enum(["join_club", "newsletter", "booking"]);

export const waitlistEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  source: waitlistSourceSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createWaitlistBodySchema = z
  .object({
    name: z.string().trim().max(120).optional(),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(40).optional(),
    source: waitlistSourceSchema.optional().default("newsletter"),
  })
  .strict();

export const listWaitlistQuerySchema = paginatedQuerySchema.extend({
  sort: z.enum(["createdAt", "email"]).optional(),
  search: z.string().trim().min(2).max(100).optional(),
});

export type WaitlistEntryDto = z.infer<typeof waitlistEntrySchema>;
export type CreateWaitlistBody = z.infer<typeof createWaitlistBodySchema>;
export type ListWaitlistQuery = z.infer<typeof listWaitlistQuerySchema>;
