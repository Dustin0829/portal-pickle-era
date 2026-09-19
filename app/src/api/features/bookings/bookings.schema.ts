import { z } from "zod";
import { nonEmptyString } from "@/api/schema/primitives.schema";
import { paginatedQuerySchema } from "@/api/schema/primitives.schema";

/** Historical + list/detail reads may still surface clinic. */
export const bookingPlanSchema = z.enum(["court", "open-play", "clinic"]);
/** New creates accept court | open-play only. */
export const bookablePlanSchema = z.enum(["court", "open-play"]);
export const bookingStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const courtIdSchema = z.enum([
  "in-1",
  "in-2",
  "in-3",
  "out-1",
  "out-2",
  "out-3",
]);

export const bookingDtoSchema = z.object({
  id: z.string(),
  plan: bookingPlanSchema,
  date: z.string(),
  courtId: z.string(),
  slotIds: z.array(z.string()).min(1),
  name: z.string(),
  email: z.string().email(),
  userId: z.string().nullable(),
  referenceId: z.string(),
  receiptName: z.string().nullable(),
  receiptKey: z.string().nullable(),
  receiptMimeType: z.string().nullable(),
  walletAppliedCents: z.number().int().nonnegative().default(0),
  status: bookingStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const bookingOccupancyItemSchema = z.object({
  id: z.string(),
  plan: bookingPlanSchema,
  date: z.string(),
  courtId: z.string(),
  slotIds: z.array(z.string()).min(1),
  status: z.enum(["pending", "approved"]),
});

const bookingBodyBase = z
  .object({
    plan: bookablePlanSchema.default("court"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    courtId: courtIdSchema,
    slotIds: z.array(z.string().min(1).max(16)).min(1).max(24),
    name: nonEmptyString.max(120),
    email: nonEmptyString.email("Enter a valid email address").max(254),
    referenceId: z.string().trim().max(120).optional(),
    receiptName: z.string().trim().max(180).optional(),
    receiptKey: z.string().trim().max(512).optional(),
    receiptMimeType: z.string().trim().max(120).optional(),
    unitPricePesos: z.number().positive().max(100_000).optional(),
    walletAppliedCents: z
      .number()
      .int()
      .nonnegative()
      .max(5_000_000)
      .optional(),
  })
  .strict();

export const createPublicBookingBodySchema = bookingBodyBase;
export const createAdminBookingBodySchema = bookingBodyBase;

export const listBookingsQuerySchema = paginatedQuerySchema.extend({
  sort: z.enum(["createdAt", "date"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().min(2).max(100).optional(),
  status: bookingStatusSchema.optional(),
});

export const occupancyQuerySchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .strict();

export const openPlaySessionItemSchema = z.object({
  slotId: z.string(),
  bookedCount: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
});

export const openPlaySessionsQuerySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();

export const patchBookingBodySchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
  })
  .strict();

/** PATCH approve may include a non-fatal invite email warning. */
export const patchBookingResponseSchema = bookingDtoSchema.extend({
  inviteEmailWarning: z.string().optional(),
});

export const listUsersQuerySchema = paginatedQuerySchema.extend({
  role: z.enum(["student", "admin"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type BookingDto = z.infer<typeof bookingDtoSchema>;
export type BookingOccupancyItem = z.infer<typeof bookingOccupancyItemSchema>;
export type CreatePublicBookingBody = z.infer<
  typeof createPublicBookingBodySchema
>;
export type CreateAdminBookingBody = z.infer<
  typeof createAdminBookingBodySchema
>;
export type ListBookingsQuery = z.input<typeof listBookingsQuerySchema>;
export type OccupancyQuery = z.infer<typeof occupancyQuerySchema>;
export type OpenPlaySessionItem = z.infer<typeof openPlaySessionItemSchema>;
export type OpenPlaySessionsQuery = z.infer<typeof openPlaySessionsQuerySchema>;
export type PatchBookingBody = z.infer<typeof patchBookingBodySchema>;
export type PatchBookingResponse = z.infer<typeof patchBookingResponseSchema>;
export type ListUsersQuery = z.input<typeof listUsersQuerySchema>;
