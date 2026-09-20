import { beforeEach, describe, expect, it } from "vitest";
import { bookingTotal, getPlanUnitPrice } from "@/lib/booking/booking";
import { readPlanUnitPrice } from "@/lib/booking/planPrices";
import {
  clearFacilitySettingsCache,
  seedFacilitySettings,
} from "@/test/helpers/facilitySettings";

describe("plan unit prices", () => {
  beforeEach(() => {
    clearFacilitySettingsCache();
    seedFacilitySettings();
  });

  it("falls back to PLAN_META when override missing", () => {
    expect(getPlanUnitPrice("court")).toBe(300);
    expect(getPlanUnitPrice("open-play")).toBe(250);
    expect(bookingTotal("court", 2)).toBe(600);
    expect(bookingTotal("open-play", 1)).toBe(250);
  });

  it("uses facility settings price for booking totals", () => {
    seedFacilitySettings({
      planPrices: { court: 450, openPlay: 250, clinic: 500 },
    });
    const price = readPlanUnitPrice("court");
    expect(bookingTotal("court", 2, price)).toBe(900);
  });

  it("defaults open-play facility price to ₱250", () => {
    expect(readPlanUnitPrice("open-play")).toBe(250);
  });
});
