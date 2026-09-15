import { z } from "zod";
import { paginatedQuerySchema } from "../../lib/pagination.schema.js";

export const OPENING_DATE = "2026-10-05";

export const bookingPlanApiSchema = z.enum(["court", "open-play", "clinic"]);
export const bookingStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const courtIdSchema = z.enum(["in-1", "in-2", "in-3", "out-1", "out-2", "out-3"]);

export const bookingDtoSchema = z.object({
  id: z.string(),
  plan: bookingPlanApiSchema,
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
  status: bookingStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const bookingOccupancyItemSchema = z.object({
  id: z.string(),
  plan: bookingPlanApiSchema,
  courtId: z.string(),
  slotIds: z.array(z.string()).min(1),
  status: z.enum(["pending", "approved"]),
});

const bookingBodyBase = z
  .object({
    plan: bookingPlanApiSchema.default("court"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    courtId: courtIdSchema,
    slotIds: z.array(z.string().min(1).max(16)).min(1).max(24),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    referenceId: z.string().trim().max(120).optional().default(""),
    receiptName: z.string().trim().max(180).optional(),
    receiptKey: z.string().trim().max(512).optional(),
    receiptMimeType: z.string().trim().max(120).optional(),
  })
  .strict();

export const createPublicBookingBodySchema = bookingBodyBase;

export const createAdminBookingBodySchema = bookingBodyBase;

export const listBookingsQuerySchema = paginatedQuerySchema.extend({
  sort: z.enum(["createdAt", "date"]).optional(),
  search: z.string().trim().min(2).max(100).optional(),
  status: bookingStatusSchema.optional(),
});

export const occupancyQuerySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();

export const bookingIdParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const patchBookingBodySchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
  })
  .strict();

export const listUsersQuerySchema = paginatedQuerySchema.extend({
  role: z.enum(["student", "admin"]).optional().default("student"),
});

export type BookingDto = z.infer<typeof bookingDtoSchema>;
export type BookingOccupancyItem = z.infer<typeof bookingOccupancyItemSchema>;
export type CreatePublicBookingBody = z.infer<typeof createPublicBookingBodySchema>;
export type CreateAdminBookingBody = z.infer<typeof createAdminBookingBodySchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
export type OccupancyQuery = z.infer<typeof occupancyQuerySchema>;
export type PatchBookingBody = z.infer<typeof patchBookingBodySchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
