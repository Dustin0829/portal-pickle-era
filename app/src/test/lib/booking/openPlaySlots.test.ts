import { beforeEach, describe, expect, it } from "vitest";
import { OPEN_PLAY_CAPACITY, SLOTS } from "@/lib/booking/booking";
import {
  getOpenPlaySlots,
  slotFromOpenPlayHour,
} from "@/lib/booking/openPlaySlots";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";

describe("openPlaySlots", () => {
  beforeEach(() => {
    useFacilitySettingsStore.getState().resetDefaults();
    localStorage.clear();
  });

  it("defaults to three 2-hour sessions", () => {
    expect(getOpenPlaySlots()).toEqual(SLOTS["open-play"]);
    expect(SLOTS["open-play"]).toEqual([
      { id: "07:00", label: "7:00–9:00 AM", hour: 7 },
      { id: "16:00", label: "4:00–6:00 PM", hour: 16 },
      { id: "18:00", label: "6:00–8:00 PM", hour: 18 },
    ]);
    expect(OPEN_PLAY_CAPACITY).toBe(30);
  });

  it("uses saved facility settings after Save", () => {
    const next = [slotFromOpenPlayHour(9), slotFromOpenPlayHour(15)];
    useFacilitySettingsStore.getState().setOpenPlaySlots(next);
    expect(getOpenPlaySlots()).toEqual([
      { id: "09:00", label: "9:00 AM – 11:00 AM", hour: 9 },
      { id: "15:00", label: "3:00 PM – 5:00 PM", hour: 15 },
    ]);
  });

  it("builds stable HH:00 ids from start hour", () => {
    expect(slotFromOpenPlayHour(7).id).toBe("07:00");
    expect(slotFromOpenPlayHour(16).id).toBe("16:00");
  });
});
