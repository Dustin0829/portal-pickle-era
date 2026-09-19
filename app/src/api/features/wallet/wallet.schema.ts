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

export type WalletTopUpStatus = z.infer<typeof walletTopUpStatusSchema>;
export type WalletTopUpDto = z.infer<typeof walletTopUpDtoSchema>;
export type MeWalletDto = z.infer<typeof meWalletDtoSchema>;
export type CreateWalletTopUpBody = z.infer<typeof createWalletTopUpBodySchema>;
export type CreateWalletTopUpFormValues = z.infer<
  typeof createWalletTopUpFormSchema
>;
export type AdminWalletTopUpDto = z.infer<typeof adminWalletTopUpDtoSchema>;
export type ListAdminWalletTopUpsQuery = z.input<
  typeof listAdminWalletTopUpsQuerySchema
>;
export type PatchAdminWalletTopUpBody = z.infer<
  typeof patchAdminWalletTopUpBodySchema
>;
