import { beforeEach, describe, expect, it } from "vitest";
import { OPEN_PLAY_CAPACITY, SLOTS } from "@/lib/booking/booking";
import {
  getOpenPlaySlots,
  slotFromOpenPlayHour,
} from "@/lib/booking/openPlaySlots";
import {
  clearFacilitySettingsCache,
  seedFacilitySettings,
} from "@/test/helpers/facilitySettings";

describe("openPlaySlots", () => {
  beforeEach(() => {
    clearFacilitySettingsCache();
    seedFacilitySettings();
  });

  it("defaults to three 2-hour sessions", () => {
    expect(getOpenPlaySlots()).toEqual([
      {
        id: "07:00",
        label: "7:00 AM – 9:00 AM",
        hour: 7,
        durationHours: 2,
      },
      {
        id: "16:00",
        label: "4:00 PM – 6:00 PM",
        hour: 16,
        durationHours: 2,
      },
      {
        id: "18:00",
        label: "6:00 PM – 8:00 PM",
        hour: 18,
        durationHours: 2,
      },
    ]);
    expect(SLOTS["open-play"]).toHaveLength(3);
    expect(OPEN_PLAY_CAPACITY).toBe(30);
  });

  it("uses saved facility settings after Save", () => {
    seedFacilitySettings({
      openPlaySessions: [
        { slotId: "09:00", hour: 9, durationHours: 2 },
        { slotId: "15:00", hour: 15, durationHours: 2 },
      ],
    });
    expect(getOpenPlaySlots()).toEqual([
      {
        id: "09:00",
        label: "9:00 AM – 11:00 AM",
        hour: 9,
        durationHours: 2,
      },
      {
        id: "15:00",
        label: "3:00 PM – 5:00 PM",
        hour: 15,
        durationHours: 2,
      },
    ]);
  });

  it("builds stable HH:00 ids from start hour", () => {
    expect(slotFromOpenPlayHour(7).id).toBe("07:00");
    expect(slotFromOpenPlayHour(16).id).toBe("16:00");
  });
});
