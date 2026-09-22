import { z } from "zod";
import { paginatedQuerySchema } from "../../lib/pagination.schema.js";

/** Max single top-up: ₱50,000 → 5_000_000 cents. */
export const MAX_TOP_UP_AMOUNT_CENTS = 5_000_000;

export const walletTopUpStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const walletTopUpDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amountCents: z.number().int(),
  receiptName: z.string().nullable(),
  receiptKey: z.string().nullable(),
  receiptMimeType: z.string().nullable(),
  status: walletTopUpStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const walletDtoSchema = z.object({
  balanceCents: z.number().int().nonnegative(),
  topUps: z.array(walletTopUpDtoSchema),
});

export const walletLedgerTypeSchema = z.enum([
  "top_up",
  "booking_debit",
  "booking_refund",
  "food_debit",
]);

export const walletLedgerEntryDtoSchema = z.object({
  id: z.string(),
  amountCents: z.number().int(),
  balanceAfterCents: z.number().int().nonnegative(),
  type: walletLedgerTypeSchema,
  referenceType: z.string().nullable(),
  referenceId: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const listMyWalletTransactionsQuerySchema = paginatedQuerySchema.extend({
  sort: z.enum(["createdAt"]).optional(),
});

export const adminWalletTopUpDtoSchema = walletTopUpDtoSchema.extend({
  userName: z.string(),
  userEmail: z.string().email(),
});

export const createWalletTopUpBodySchema = z
  .object({
    amountCents: z.number().int().positive().max(MAX_TOP_UP_AMOUNT_CENTS),
    receiptName: z.string().trim().max(180).optional(),
    receiptKey: z.string().trim().min(1).max(512),
    receiptMimeType: z.string().trim().max(120).optional(),
  })
  .strict();

export const listAdminTopUpsQuerySchema = paginatedQuerySchema.extend({
  sort: z.enum(["createdAt"]).optional(),
  status: walletTopUpStatusSchema.optional(),
});

export const topUpIdParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const patchTopUpBodySchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
  })
  .strict();

export const walletReceiptUrlResponseSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string().datetime(),
});

export const adminUserIdParamsSchema = z
  .object({
    userId: z.string().min(1),
  })
  .strict();

export const adminWalletProfileBookingSchema = z.object({
  id: z.string(),
  plan: z.string(),
  date: z.string(),
  status: z.string(),
  courtId: z.string(),
  createdAt: z.string().datetime(),
});

export const adminWalletProfileDtoSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    createdAt: z.string().datetime(),
  }),
  balanceCents: z.number().int().nonnegative(),
  bookingsCount: z.number().int().nonnegative(),
  recentBookings: z.array(adminWalletProfileBookingSchema),
});

export const createAdminManualCreditBodySchema = z
  .object({
    userId: z.string().min(1),
    amountCents: z.number().int().positive().max(MAX_TOP_UP_AMOUNT_CENTS),
  })
  .strict();

export const adminManualCreditResponseSchema = z.object({
  balanceAfterCents: z.number().int().nonnegative(),
  referenceId: z.string(),
});

export type WalletDto = z.infer<typeof walletDtoSchema>;
export type WalletTopUpDto = z.infer<typeof walletTopUpDtoSchema>;
export type WalletLedgerEntryDto = z.infer<typeof walletLedgerEntryDtoSchema>;
export type AdminWalletTopUpDto = z.infer<typeof adminWalletTopUpDtoSchema>;
export type CreateWalletTopUpBody = z.infer<typeof createWalletTopUpBodySchema>;
export type ListAdminTopUpsQuery = z.infer<typeof listAdminTopUpsQuerySchema>;
export type ListMyWalletTransactionsQuery = z.infer<typeof listMyWalletTransactionsQuerySchema>;
export type PatchTopUpBody = z.infer<typeof patchTopUpBodySchema>;
export type WalletReceiptUrlResponse = z.infer<typeof walletReceiptUrlResponseSchema>;
export type AdminWalletProfileDto = z.infer<typeof adminWalletProfileDtoSchema>;
export type CreateAdminManualCreditBody = z.infer<typeof createAdminManualCreditBodySchema>;
export type AdminManualCreditResponse = z.infer<typeof adminManualCreditResponseSchema>;
