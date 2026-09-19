import { describe, expect, it } from "vitest";
import { walletAppliedAndRemaining } from "@/lib/booking/walletBookingPay";

describe("walletAppliedAndRemaining", () => {
  it("applies min(balance, total) and remaining cash", () => {
    expect(
      walletAppliedAndRemaining({ balanceCents: 50_000, totalPesos: 600 }),
    ).toEqual({
      totalCents: 60_000,
      walletAppliedCents: 50_000,
      remainingCashCents: 10_000,
    });
  });

  it("covers full total when balance is enough", () => {
    expect(
      walletAppliedAndRemaining({ balanceCents: 100_000, totalPesos: 250 }),
    ).toEqual({
      totalCents: 25_000,
      walletAppliedCents: 25_000,
      remainingCashCents: 0,
    });
  });

  it("applies zero when wallet is empty", () => {
    expect(
      walletAppliedAndRemaining({ balanceCents: 0, totalPesos: 300 }),
    ).toEqual({
      totalCents: 30_000,
      walletAppliedCents: 0,
      remainingCashCents: 30_000,
    });
  });
});
