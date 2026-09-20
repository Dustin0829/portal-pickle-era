import { describe, expect, it } from "vitest";
import { paymentMethodLogoSrc } from "@/lib/booking/paymentMethodLogo";

describe("paymentMethodLogoSrc", () => {
  it("maps common PH wallet and bank labels to local PNGs", () => {
    expect(paymentMethodLogoSrc("GCash")).toBe("/payment-logos/gcash.png");
    expect(paymentMethodLogoSrc("Maya")).toBe("/payment-logos/maya.png");
    expect(paymentMethodLogoSrc("PayMaya")).toBe("/payment-logos/maya.png");
    expect(paymentMethodLogoSrc("BDO")).toBe("/payment-logos/bdo.png");
    expect(paymentMethodLogoSrc("BPI")).toBe("/payment-logos/bpi.png");
  });

  it("returns null for unknown labels", () => {
    expect(paymentMethodLogoSrc("UnionBank")).toBeNull();
  });
});
