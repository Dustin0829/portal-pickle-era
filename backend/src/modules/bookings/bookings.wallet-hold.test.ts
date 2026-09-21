import assert from "node:assert/strict";
import test from "node:test";
import { bookingApproveNeedsDebit, bookingRejectNeedsRefund } from "./bookings.wallet-hold.js";

test("pending create hold: approve skips debit when booking_debit exists", () => {
  assert.equal(
    bookingApproveNeedsDebit({ hasPriorDebit: true, walletAppliedCents: 50_000 }),
    false,
  );
});

test("legacy approve: debit once when no prior booking_debit", () => {
  assert.equal(
    bookingApproveNeedsDebit({ hasPriorDebit: false, walletAppliedCents: 50_000 }),
    true,
  );
});

test("approve with zero credits: no debit", () => {
  assert.equal(bookingApproveNeedsDebit({ hasPriorDebit: false, walletAppliedCents: 0 }), false);
});

test("reject refunds when booking_debit exists and no refund yet", () => {
  assert.equal(
    bookingRejectNeedsRefund({
      hasPriorDebit: true,
      hasPriorRefund: false,
      walletAppliedCents: 50_000,
    }),
    true,
  );
});

test("legacy reject: no-op without booking_debit", () => {
  assert.equal(
    bookingRejectNeedsRefund({
      hasPriorDebit: false,
      hasPriorRefund: false,
      walletAppliedCents: 50_000,
    }),
    false,
  );
});

test("reject does not double-refund", () => {
  assert.equal(
    bookingRejectNeedsRefund({
      hasPriorDebit: true,
      hasPriorRefund: true,
      walletAppliedCents: 50_000,
    }),
    false,
  );
});

test("reject with zero credits: no refund", () => {
  assert.equal(
    bookingRejectNeedsRefund({
      hasPriorDebit: false,
      hasPriorRefund: false,
      walletAppliedCents: 0,
    }),
    false,
  );
});
