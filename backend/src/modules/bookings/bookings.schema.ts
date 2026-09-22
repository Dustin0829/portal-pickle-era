import { z } from "zod";
import { paginatedQuerySchema } from "../../lib/pagination.schema.js";

export const OPENING_DATE = "2026-10-05";
export const OPEN_PLAY_CAPACITY = 30;

/** Plans accepted on booking create (clinic retired from new bookings). */
export const bookingPlanCreateSchema = z.enum(["court", "open-play"]);
/** Full plan set for DTOs / occupancy (historical clinic rows may still appear). */
export const bookingPlanApiSchema = z.enum(["court", "open-play", "clinic"]);
export const bookingStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const courtIdSchema = z.enum(["in-1", "in-2", "in-3", "out-1", "out-2", "out-3"]);

export const courtSlotSchema = z
  .object({
    courtId: courtIdSchema,
    slotIds: z.array(z.string().min(1).max(16)).min(1).max(24),
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

export const bookingDtoSchema = z.object({
  id: z.string(),
  plan: bookingPlanApiSchema,
  date: z.string(),
  /** First court (compat / Open Play placeholder). */
  courtId: z.string(),
  /** Union of hours across segments (or Open Play session ids). */
  slotIds: z.array(z.string()).min(1),
  /** Per-court hour segments for private court bookings. */
  courtSlots: z.array(courtSlotSchema).min(1),
  name: z.string(),
  email: z.string().email(),
  userId: z.string().nullable(),
  referenceId: z.string(),
  receiptName: z.string().nullable(),
  receiptKey: z.string().nullable(),
  receiptMimeType: z.string().nullable(),
  walletAppliedCents: z.number().int().nonnegative(),
  status: bookingStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const bookingOccupancyItemSchema = z.object({
  id: z.string(),
  plan: bookingPlanApiSchema,
  date: z.string(),
  courtId: z.string(),
  slotIds: z.array(z.string()).min(1),
  status: z.enum(["pending", "approved"]),
});

const bookingBodyBase = z
  .object({
    plan: bookingPlanCreateSchema.default("court"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** Legacy single-court create — normalized to courtSlots when courtSlots omitted. */
    courtId: courtIdSchema.optional(),
    slotIds: z.array(z.string().min(1).max(16)).min(1).max(24).optional(),
    courtSlots: z.array(courtSlotSchema).min(1).max(6).optional(),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    referenceId: z.string().trim().max(120).optional().default(""),
    receiptName: z.string().trim().max(180).optional(),
    receiptKey: z.string().trim().max(512).optional(),
    receiptMimeType: z.string().trim().max(120).optional(),
    /** Pesos unit price from facility settings; server converts to cents for totals. */
    unitPricePesos: z.number().positive().max(100_000).optional(),
    walletAppliedCents: z.number().int().nonnegative().max(5_000_000).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.courtSlots && value.courtSlots.length > 0) return;
    if (value.courtId && value.slotIds && value.slotIds.length > 0) return;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide courtSlots or courtId with slotIds",
    });
  });

export const createPublicBookingBodySchema = bookingBodyBase;

export const createAdminBookingBodySchema = bookingBodyBase;

export const listBookingsQuerySchema = paginatedQuerySchema.extend({
  sort: z.enum(["createdAt", "date"]).optional(),
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
  .strict()
  .superRefine((value, ctx) => {
    if (value.date) return;
    if (value.from && value.to) {
      if (value.from > value.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "from must be on or before to",
          path: ["from"],
        });
      }
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide date or from and to",
    });
  });

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

/** PATCH /admin/bookings/:id — booking DTO plus optional non-fatal invite warning. */
export const patchBookingResponseSchema = bookingDtoSchema.extend({
  inviteEmailWarning: z.string().optional(),
});

export const bookingReceiptUrlResponseSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string().datetime(),
});

export const listUsersQuerySchema = paginatedQuerySchema.extend({
  role: z.enum(["student", "admin"]).optional().default("student"),
  search: z.string().trim().min(2).max(100).optional(),
});

export type CourtSlot = z.infer<typeof courtSlotSchema>;
export type BookingDto = z.infer<typeof bookingDtoSchema>;
export type BookingOccupancyItem = z.infer<typeof bookingOccupancyItemSchema>;
export type OpenPlaySessionItem = z.infer<typeof openPlaySessionItemSchema>;
export type CreatePublicBookingBody = z.infer<typeof createPublicBookingBodySchema>;
export type CreateAdminBookingBody = z.infer<typeof createAdminBookingBodySchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
export type OccupancyQuery = z.infer<typeof occupancyQuerySchema>;
export type OpenPlaySessionsQuery = z.infer<typeof openPlaySessionsQuerySchema>;
export type PatchBookingBody = z.infer<typeof patchBookingBodySchema>;
export type PatchBookingResponse = z.infer<typeof patchBookingResponseSchema>;
export type BookingReceiptUrlResponse = z.infer<typeof bookingReceiptUrlResponseSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
