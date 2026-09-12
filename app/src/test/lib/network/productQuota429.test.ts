import { describe, expect, it } from "vitest";
import { shouldMarkRateLimitedOn429 } from "@/lib/network/productQuota429";

describe("shouldMarkRateLimitedOn429", () => {
  it("trips the gate for a generic 429 with no code", () => {
    expect(shouldMarkRateLimitedOn429(undefined)).toBe(true);
  });

  it("trips the gate for an unknown code", () => {
    expect(shouldMarkRateLimitedOn429("SOMETHING_ELSE")).toBe(true);
  });
});
