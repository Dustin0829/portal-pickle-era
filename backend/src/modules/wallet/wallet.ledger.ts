import type { Prisma, WalletLedgerType } from "../../generated/prisma/client.js";
import { ConflictError } from "../../lib/errors.js";

export type ApplyWalletDeltaInput = {
  userId: string;
  /** Signed: positive credits the wallet, negative debits. */
  amountCents: number;
  type: WalletLedgerType;
  referenceType?: string | null;
  referenceId?: string | null;
  insufficientFundsMessage?: string;
};

/**
 * Atomically mutate wallet balance and append a ledger row.
 * Must run inside a Prisma interactive transaction.
 */
export async function applyWalletDelta(
  tx: Prisma.TransactionClient,
  input: ApplyWalletDeltaInput,
): Promise<{ balanceAfterCents: number }> {
  if (input.amountCents === 0) {
    const wallet = await tx.wallet.upsert({
      where: { userId: input.userId },
      create: { userId: input.userId, balanceCents: 0 },
      update: {},
      select: { balanceCents: true },
    });
    return { balanceAfterCents: wallet.balanceCents };
  }

  await tx.wallet.upsert({
    where: { userId: input.userId },
    create: { userId: input.userId, balanceCents: 0 },
    update: {},
  });

  if (input.amountCents < 0) {
    const debit = -input.amountCents;
    const updated = await tx.wallet.updateMany({
      where: { userId: input.userId, balanceCents: { gte: debit } },
      data: { balanceCents: { decrement: debit } },
    });
    if (updated.count !== 1) {
      throw new ConflictError(input.insufficientFundsMessage ?? "Insufficient wallet balance");
    }
  } else {
    await tx.wallet.update({
      where: { userId: input.userId },
      data: { balanceCents: { increment: input.amountCents } },
    });
  }

  const wallet = await tx.wallet.findUniqueOrThrow({
    where: { userId: input.userId },
    select: { balanceCents: true },
  });

  await tx.walletLedgerEntry.create({
    data: {
      userId: input.userId,
      amountCents: input.amountCents,
      balanceAfterCents: wallet.balanceCents,
      type: input.type,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
    },
  });

  return { balanceAfterCents: wallet.balanceCents };
}

export async function findWalletLedgerByRef(
  tx: Prisma.TransactionClient,
  input: {
    type: WalletLedgerType;
    referenceType: string;
    referenceId: string;
  },
) {
  return tx.walletLedgerEntry.findFirst({
    where: {
      type: input.type,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
    },
    select: {
      id: true,
      userId: true,
      amountCents: true,
      type: true,
    },
  });
}
