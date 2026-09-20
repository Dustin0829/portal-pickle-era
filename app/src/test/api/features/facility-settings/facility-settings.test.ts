import { describe, expect, it } from "vitest";
import { facilitySettingsDtoSchema } from "@/api/features/facility-settings/facility-settings.schema";
import { fallbackFacilitySettings } from "@/lib/facility/facilitySettingsView";
import {
  clearFacilitySettingsCache,
  seedFacilitySettings,
} from "@/test/helpers/facilitySettings";
import { readPlanUnitPrice } from "@/lib/booking/planPrices";
import { readPaymentMethods } from "@/lib/wallet/paymentSettings";

describe("facility settings API cache", () => {
  it("parses DTO shape", () => {
    expect(() =>
      facilitySettingsDtoSchema.parse(fallbackFacilitySettings()),
    ).not.toThrow();
  });

  it("cleared localStorage still reads seeded API cache", () => {
    clearFacilitySettingsCache();
    seedFacilitySettings({
      planPrices: { court: 410, openPlay: 200, clinic: 500 },
      paymentMethods: [
        {
          id: "bdo",
          label: "BDO",
          name: "Facility",
          number: "1234",
          qrImageKey: null,
          qrImageUrl: null,
          sortOrder: 0,
        },
      ],
    });
    localStorage.clear();
    expect(readPlanUnitPrice("court")).toBe(410);
    expect(readPaymentMethods()[0]?.label).toBe("BDO");
  });

  it("GET failure fallback does not re-persist to localStorage", () => {
    clearFacilitySettingsCache();
    localStorage.clear();
    expect(readPlanUnitPrice("court")).toBe(300);
    expect(localStorage.getItem("pickle-era-facility-settings")).toBeNull();
  });
});
