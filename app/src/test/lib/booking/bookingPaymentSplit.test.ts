import { describe, expect, it } from "vitest";
import { bookingPaymentSplit } from "@/lib/booking/bookingPaymentSplit";

describe("bookingPaymentSplit", () => {
  it("splits partial credits", () => {
    expect(
      bookingPaymentSplit({ totalPesos: 300, walletAppliedCents: 20_000 }),
    ).toEqual({
      totalCents: 30_000,
      walletAppliedCents: 20_000,
      remainingCashCents: 10_000,
      isSplit: true,
    });
  });

  it("full credits leaves remaining 0", () => {
    expect(
      bookingPaymentSplit({ totalPesos: 300, walletAppliedCents: 30_000 }),
    ).toEqual({
      totalCents: 30_000,
      walletAppliedCents: 30_000,
      remainingCashCents: 0,
      isSplit: true,
    });
  });

  it("missing credits is not a split", () => {
    expect(bookingPaymentSplit({ totalPesos: 300 })).toEqual({
      totalCents: 30_000,
      walletAppliedCents: 0,
      remainingCashCents: 30_000,
      isSplit: false,
    });
  });

  it("clamps credits above total", () => {
    expect(
      bookingPaymentSplit({ totalPesos: 300, walletAppliedCents: 99_000 }),
    ).toEqual({
      totalCents: 30_000,
      walletAppliedCents: 30_000,
      remainingCashCents: 0,
      isSplit: true,
    });
  });
});
