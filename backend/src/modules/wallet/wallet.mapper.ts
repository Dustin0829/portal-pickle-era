import type { Prisma } from "../../generated/prisma/client.js";
import { ConflictError } from "../../lib/errors.js";
import type { AdminWalletTopUpDto, WalletTopUpDto } from "./wallet.schema.js";

export const walletTopUpPublicSelect = {
  id: true,
  userId: true,
  amountCents: true,
  receiptName: true,
  receiptKey: true,
  receiptMimeType: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.WalletTopUpSelect;

export const walletTopUpAdminSelect = {
  ...walletTopUpPublicSelect,
  user: {
    select: {
      name: true,
      email: true,
    },
  },
} as const satisfies Prisma.WalletTopUpSelect;

export type WalletTopUpPublicRow = Prisma.WalletTopUpGetPayload<{
  select: typeof walletTopUpPublicSelect;
}>;

export type WalletTopUpAdminRow = Prisma.WalletTopUpGetPayload<{
  select: typeof walletTopUpAdminSelect;
}>;

export function toWalletTopUpDto(row: WalletTopUpPublicRow): WalletTopUpDto {
  return {
    id: row.id,
    userId: row.userId,
    amountCents: row.amountCents,
    receiptName: row.receiptName,
    receiptKey: row.receiptKey,
    receiptMimeType: row.receiptMimeType,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toAdminWalletTopUpDto(row: WalletTopUpAdminRow): AdminWalletTopUpDto {
  return {
    ...toWalletTopUpDto(row),
    userName: row.user.name,
    userEmail: row.user.email,
  };
}

/**
 * Pure helper: conditional pending→approved/rejected must update exactly one row.
 * Used by approve/reject paths and concurrent-approve tests.
 */
export function assertPendingTransitionApplied(count: number) {
  if (count !== 1) {
    throw new ConflictError("Top-up already processed");
  }
}
