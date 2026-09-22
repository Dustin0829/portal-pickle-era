import { describe, expect, it } from "vitest";
import { createAdminManualCreditFormSchema } from "@/api/features/wallet/wallet.schema";

describe("manual top-up form schema", () => {
  it("accepts peso amounts within bounds", () => {
    expect(
      createAdminManualCreditFormSchema.safeParse({ amountPesos: 500 }).success,
    ).toBe(true);
    expect(
      createAdminManualCreditFormSchema.safeParse({ amountPesos: 0 }).success,
    ).toBe(false);
  });
});

describe("manual top-up credit body schema", () => {
  it("requires a bank method label when channel is bank", async () => {
    const { createAdminManualCreditBodySchema } =
      await import("@/api/features/wallet/wallet.schema");
    expect(
      createAdminManualCreditBodySchema.safeParse({
        userId: "u1",
        amountCents: 50_000,
        paymentChannel: "cash",
      }).success,
    ).toBe(true);
    expect(
      createAdminManualCreditBodySchema.safeParse({
        userId: "u1",
        amountCents: 50_000,
        paymentChannel: "bank",
      }).success,
    ).toBe(false);
    expect(
      createAdminManualCreditBodySchema.safeParse({
        userId: "u1",
        amountCents: 50_000,
        paymentChannel: "bank",
        paymentMethodLabel: "GCash",
      }).success,
    ).toBe(true);
  });
});
