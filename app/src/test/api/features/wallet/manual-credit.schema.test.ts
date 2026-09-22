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
