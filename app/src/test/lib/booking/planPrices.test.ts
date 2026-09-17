import { beforeEach, describe, expect, it } from "vitest";
import { bookingTotal, getPlanUnitPrice } from "@/lib/booking/booking";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";

describe("plan unit prices", () => {
  beforeEach(() => {
    useFacilitySettingsStore.getState().resetDefaults();
  });

  it("falls back to PLAN_META when override missing", () => {
    expect(getPlanUnitPrice("court")).toBe(300);
    expect(bookingTotal("court", 2)).toBe(600);
  });

  it("uses facility settings price for booking totals", () => {
    useFacilitySettingsStore.getState().setPlanPrice("court", 450);
    const price = useFacilitySettingsStore.getState().plans.court.price;
    expect(bookingTotal("court", 2, price)).toBe(900);
  });
});
