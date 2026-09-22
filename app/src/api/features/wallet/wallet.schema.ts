import { z } from "zod";
import {
  nonEmptyString,
  paginatedQuerySchema,
} from "@/api/schema/primitives.schema";

/** Max single top-up: ₱50,000 → 5_000_000 cents (design). */
export const MAX_TOP_UP_CENTS = 5_000_000;
export const MIN_TOP_UP_CENTS = 1;

export const walletTopUpStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);

export const walletTopUpDtoSchema = z.object({
  id: z.string(),
  amountCents: z.number().int().nonnegative(),
  receiptKey: z.string(),
  receiptName: z.string().nullable(),
  receiptMimeType: z.string().nullable(),
  status: walletTopUpStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const meWalletDtoSchema = z.object({
  balanceCents: z.number().int().nonnegative(),
  topUps: z.array(walletTopUpDtoSchema),
});

export const createWalletTopUpBodySchema = z
  .object({
    amountCents: z
      .number()
      .int()
      .min(MIN_TOP_UP_CENTS, "Amount must be at least ₱1")
      .max(MAX_TOP_UP_CENTS, "Amount cannot exceed ₱50,000"),
    receiptKey: nonEmptyString.max(512),
    receiptName: z.string().trim().max(180).optional(),
    receiptMimeType: z.string().trim().max(120).optional(),
  })
  .strict();

/** Student form: pesos input (converted to cents before POST). */
export const createWalletTopUpFormSchema = z
  .object({
    amountPesos: z.coerce
      .number()
      .finite("Enter an amount in pesos")
      .min(1, "Amount must be at least ₱1")
      .max(50_000, "Amount cannot exceed ₱50,000"),
  })
  .strict();

export const adminWalletTopUpDtoSchema = walletTopUpDtoSchema.extend({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
});

export const listAdminWalletTopUpsQuerySchema = paginatedQuerySchema.extend({
  status: walletTopUpStatusSchema.optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const patchAdminWalletTopUpBodySchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
  })
  .strict();

export const walletReceiptUrlSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string(),
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
  createdAt: z.string(),
});

export const listMeWalletTransactionsQuerySchema = paginatedQuerySchema.extend({
  order: z.enum(["asc", "desc"]).optional(),
});

export const adminWalletProfileBookingSchema = z.object({
  id: z.string(),
  plan: z.string(),
  date: z.string(),
  status: z.string(),
  courtId: z.string(),
  createdAt: z.string(),
});

export const adminWalletProfileDtoSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    createdAt: z.string(),
  }),
  balanceCents: z.number().int().nonnegative(),
  bookingsCount: z.number().int().nonnegative(),
  recentBookings: z.array(adminWalletProfileBookingSchema),
});

export const createAdminManualCreditBodySchema = z
  .object({
    userId: z.string().min(1),
    amountCents: z.number().int().min(MIN_TOP_UP_CENTS).max(MAX_TOP_UP_CENTS),
    paymentChannel: z.enum(["cash", "bank"]),
    paymentMethodLabel: z.string().trim().min(1).max(80).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.paymentChannel === "bank" && !value.paymentMethodLabel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a bank or e-wallet method",
        path: ["paymentMethodLabel"],
      });
    }
  });

export const createAdminManualCreditFormSchema = z
  .object({
    amountPesos: z.coerce
      .number()
      .finite("Enter an amount in pesos")
      .min(1, "Amount must be at least ₱1")
      .max(50_000, "Amount cannot exceed ₱50,000"),
  })
  .strict();

export const adminManualCreditResponseSchema = z.object({
  balanceAfterCents: z.number().int().nonnegative(),
  referenceId: z.string(),
  paymentChannel: z.enum(["cash", "bank"]),
  paymentMethodLabel: z.string().nullable(),
});

export type WalletTopUpStatus = z.infer<typeof walletTopUpStatusSchema>;
export type WalletTopUpDto = z.infer<typeof walletTopUpDtoSchema>;
export type MeWalletDto = z.infer<typeof meWalletDtoSchema>;
export type WalletLedgerEntryDto = z.infer<typeof walletLedgerEntryDtoSchema>;
export type WalletLedgerType = z.infer<typeof walletLedgerTypeSchema>;
export type CreateWalletTopUpBody = z.infer<typeof createWalletTopUpBodySchema>;
export type CreateWalletTopUpFormValues = z.infer<
  typeof createWalletTopUpFormSchema
>;
export type AdminWalletTopUpDto = z.infer<typeof adminWalletTopUpDtoSchema>;
export type ListAdminWalletTopUpsQuery = z.input<
  typeof listAdminWalletTopUpsQuerySchema
>;
export type ListMeWalletTransactionsQuery = z.input<
  typeof listMeWalletTransactionsQuerySchema
>;
export type PatchAdminWalletTopUpBody = z.infer<
  typeof patchAdminWalletTopUpBodySchema
>;
export type AdminWalletProfileDto = z.infer<typeof adminWalletProfileDtoSchema>;
export type CreateAdminManualCreditBody = z.infer<
  typeof createAdminManualCreditBodySchema
>;
export type CreateAdminManualCreditFormValues = z.infer<
  typeof createAdminManualCreditFormSchema
>;
export type AdminManualCreditResponse = z.infer<
  typeof adminManualCreditResponseSchema
>;
