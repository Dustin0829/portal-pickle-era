import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "../../generated/prisma/client.js";
import { ConflictError } from "../../lib/errors.js";
import { applyWalletDelta } from "./wallet.ledger.js";

type FakeLedgerRow = {
  userId: string;
  amountCents: number;
  balanceAfterCents: number;
  type: string;
  referenceType: string | null;
  referenceId: string | null;
};

function createFakeTx(initialBalance: number) {
  let balance = initialBalance;
  const ledger: FakeLedgerRow[] = [];

  const tx = {
    wallet: {
      upsert: async () => ({ balanceCents: balance }),
      updateMany: async (args: {
        where: { userId: string; balanceCents?: { gte: number } };
        data: { balanceCents: { decrement: number } };
      }) => {
        const min = args.where.balanceCents?.gte;
        if (min !== undefined && balance < min) {
          return { count: 0 };
        }
        balance -= args.data.balanceCents.decrement;
        return { count: 1 };
      },
      update: async (args: { data: { balanceCents: { increment: number } } }) => {
        balance += args.data.balanceCents.increment;
        return { balanceCents: balance };
      },
      findUniqueOrThrow: async () => ({ balanceCents: balance }),
    },
    walletLedgerEntry: {
      create: async (args: { data: FakeLedgerRow }) => {
        ledger.push(args.data);
        return args.data;
      },
    },
    _ledger: ledger,
    _balance: () => balance,
  };

  return tx as unknown as Prisma.TransactionClient & {
    _ledger: FakeLedgerRow[];
    _balance: () => number;
  };
}

test("applyWalletDelta credits balance and writes ledger", async () => {
  const tx = createFakeTx(0);
  const result = await applyWalletDelta(tx, {
    userId: "u1",
    amountCents: 50_000,
    type: "top_up",
    referenceType: "wallet_top_up",
    referenceId: "tu1",
  });
  assert.equal(result.balanceAfterCents, 50_000);
  assert.equal(tx._balance(), 50_000);
  assert.equal(tx._ledger.length, 1);
  assert.equal(tx._ledger[0]!.amountCents, 50_000);
  assert.equal(tx._ledger[0]!.type, "top_up");
  assert.equal(tx._ledger[0]!.balanceAfterCents, 50_000);
});

test("applyWalletDelta debits food and writes ledger", async () => {
  const tx = createFakeTx(20_000);
  const result = await applyWalletDelta(tx, {
    userId: "u1",
    amountCents: -12_000,
    type: "food_debit",
    referenceType: "food_order",
    referenceId: "fo1",
  });
  assert.equal(result.balanceAfterCents, 8_000);
  assert.equal(tx._ledger[0]!.amountCents, -12_000);
  assert.equal(tx._ledger[0]!.type, "food_debit");
});

test("applyWalletDelta insufficient funds leaves balance and no ledger", async () => {
  const tx = createFakeTx(100);
  await assert.rejects(
    () =>
      applyWalletDelta(tx, {
        userId: "u1",
        amountCents: -500,
        type: "booking_debit",
        insufficientFundsMessage: "Insufficient wallet balance to apply credits to this booking",
      }),
    (error: unknown) =>
      error instanceof ConflictError &&
      error.message === "Insufficient wallet balance to apply credits to this booking",
  );
  assert.equal(tx._balance(), 100);
  assert.equal(tx._ledger.length, 0);
});

test("applyWalletDelta zero amount is a no-op without ledger", async () => {
  const tx = createFakeTx(1_000);
  const result = await applyWalletDelta(tx, {
    userId: "u1",
    amountCents: 0,
    type: "top_up",
  });
  assert.equal(result.balanceAfterCents, 1_000);
  assert.equal(tx._ledger.length, 0);
});
