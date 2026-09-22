import assert from "node:assert/strict";
import test from "node:test";
import { ConflictError, UnauthorizedError } from "../../lib/errors.js";
import { assertPendingTransitionApplied, toWalletTopUpDto } from "./wallet.mapper.js";
import {
  MAX_TOP_UP_AMOUNT_CENTS,
  createAdminManualCreditBodySchema,
  createWalletTopUpBodySchema,
  listMyWalletTransactionsQuerySchema,
  patchTopUpBodySchema,
  walletDtoSchema,
  walletLedgerEntryDtoSchema,
  walletReceiptUrlResponseSchema,
} from "./wallet.schema.js";
import { getMyTopUpReceiptUrl, getMyWallet, listMyWalletTransactions } from "./wallet.service.js";
import { toWalletLedgerEntryDto } from "./wallet.mapper.js";

test("create top-up schema: pending amount must be positive and within max", () => {
  assert.equal(
    createWalletTopUpBodySchema.safeParse({
      amountCents: 10_000,
      receiptKey: "uploads/abc.png",
    }).success,
    true,
  );
  assert.equal(
    createWalletTopUpBodySchema.safeParse({
      amountCents: 0,
      receiptKey: "uploads/abc.png",
    }).success,
    false,
  );
  assert.equal(
    createWalletTopUpBodySchema.safeParse({
      amountCents: -100,
      receiptKey: "uploads/abc.png",
    }).success,
    false,
  );
  assert.equal(
    createWalletTopUpBodySchema.safeParse({
      amountCents: MAX_TOP_UP_AMOUNT_CENTS + 1,
      receiptKey: "uploads/abc.png",
    }).success,
    false,
  );
  assert.equal(
    createWalletTopUpBodySchema.safeParse({
      amountCents: MAX_TOP_UP_AMOUNT_CENTS,
      receiptKey: "uploads/abc.png",
    }).success,
    true,
  );
});

test("manual credit schema: positive amount within max, requires userId", () => {
  assert.equal(
    createAdminManualCreditBodySchema.safeParse({
      userId: "user_1",
      amountCents: 10_000,
      paymentChannel: "cash",
    }).success,
    true,
  );
  assert.equal(
    createAdminManualCreditBodySchema.safeParse({
      userId: "user_1",
      amountCents: 10_000,
      paymentChannel: "bank",
      paymentMethodLabel: "GCash",
    }).success,
    true,
  );
  assert.equal(
    createAdminManualCreditBodySchema.safeParse({
      userId: "user_1",
      amountCents: 10_000,
      paymentChannel: "bank",
    }).success,
    false,
  );
  assert.equal(
    createAdminManualCreditBodySchema.safeParse({
      userId: "user_1",
      amountCents: 0,
      paymentChannel: "cash",
    }).success,
    false,
  );
  assert.equal(
    createAdminManualCreditBodySchema.safeParse({
      userId: "user_1",
      amountCents: MAX_TOP_UP_AMOUNT_CENTS + 1,
      paymentChannel: "cash",
    }).success,
    false,
  );
  assert.equal(
    createAdminManualCreditBodySchema.safeParse({
      amountCents: 10_000,
      paymentChannel: "cash",
    }).success,
    false,
  );
});

test("patch top-up body only approved or rejected", () => {
  assert.equal(patchTopUpBodySchema.safeParse({ status: "pending" }).success, false);
  assert.equal(patchTopUpBodySchema.safeParse({ status: "approved" }).success, true);
  assert.equal(patchTopUpBodySchema.safeParse({ status: "rejected" }).success, true);
});

test("wallet dto schema: balance + top-ups", () => {
  assert.equal(
    walletDtoSchema.safeParse({
      balanceCents: 0,
      topUps: [],
    }).success,
    true,
  );
  assert.equal(
    walletDtoSchema.safeParse({
      balanceCents: -1,
      topUps: [],
    }).success,
    false,
  );
});

test("receipt url response schema", () => {
  assert.equal(
    walletReceiptUrlResponseSchema.safeParse({
      url: "https://storage.example/object?X-Amz-Signature=abc",
      expiresAt: "2026-01-01T00:05:00.000Z",
    }).success,
    true,
  );
});

test("top-up mapper serializes dates (pending top-up shape)", () => {
  const dto = toWalletTopUpDto({
    id: "tu_1",
    userId: "user_1",
    amountCents: 50_000,
    receiptName: "gcash.png",
    receiptKey: "uploads/gcash.png",
    receiptMimeType: "image/png",
    status: "pending",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  });
  assert.equal(dto.status, "pending");
  assert.equal(dto.amountCents, 50_000);
  assert.equal(dto.createdAt, "2026-01-01T00:00:00.000Z");
});

test("approve credits once: pending transition count must be 1", () => {
  assert.doesNotThrow(() => assertPendingTransitionApplied(1));
});

test("concurrent approve does not double-credit: second transition throws", () => {
  assert.throws(
    () => assertPendingTransitionApplied(0),
    (error: unknown) => error instanceof ConflictError && error.statusCode === 409,
  );
});

test("reject path uses same pending guard (no credit when already processed)", () => {
  assert.throws(
    () => assertPendingTransitionApplied(0),
    (error: unknown) =>
      error instanceof ConflictError && error.message === "Top-up already processed",
  );
});

test("getMyWallet requires session", async () => {
  await assert.rejects(
    () => getMyWallet(undefined),
    (error: unknown) => error instanceof UnauthorizedError && error.statusCode === 401,
  );
});

test("listMyWalletTransactions requires session", async () => {
  await assert.rejects(
    () => listMyWalletTransactions(undefined, { page: 1, limit: 20, order: "desc" }),
    (error: unknown) => error instanceof UnauthorizedError && error.statusCode === 401,
  );
});

test("getMyTopUpReceiptUrl requires session", async () => {
  await assert.rejects(
    () => getMyTopUpReceiptUrl("tu_1", undefined),
    (error: unknown) => error instanceof UnauthorizedError && error.statusCode === 401,
  );
});

test("wallet ledger entry dto schema accepts signed amounts", () => {
  assert.equal(
    walletLedgerEntryDtoSchema.safeParse({
      id: "le1",
      amountCents: -50_000,
      balanceAfterCents: 0,
      type: "booking_debit",
      referenceType: "booking",
      referenceId: "b1",
      createdAt: "2026-09-22T00:00:00.000Z",
    }).success,
    true,
  );
  assert.equal(
    walletLedgerEntryDtoSchema.safeParse({
      id: "le2",
      amountCents: 12_000,
      balanceAfterCents: 12_000,
      type: "top_up",
      referenceType: null,
      referenceId: null,
      createdAt: "2026-09-22T00:00:00.000Z",
    }).success,
    true,
  );
});

test("list transactions query defaults page/limit", () => {
  const parsed = listMyWalletTransactionsQuerySchema.parse({});
  assert.equal(parsed.page, 1);
  assert.equal(parsed.limit, 20);
  assert.equal(parsed.order, "desc");
});

test("ledger mapper serializes createdAt ISO", () => {
  const dto = toWalletLedgerEntryDto({
    id: "le1",
    amountCents: 50_000,
    balanceAfterCents: 50_000,
    type: "top_up",
    referenceType: "wallet_top_up",
    referenceId: "tu1",
    createdAt: new Date("2026-09-22T12:00:00.000Z"),
  });
  assert.equal(dto.createdAt, "2026-09-22T12:00:00.000Z");
  assert.equal(dto.type, "top_up");
});
