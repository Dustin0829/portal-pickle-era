import { describe, expect, it } from "vitest";
import {
  coveredHoursForOpenPlaySlotIds,
  DEFAULT_OPEN_PLAY_SESSIONS,
  expandOpenPlaySessionToHourIds,
  hourSetsOverlap,
} from "@/lib/booking/openPlayHours";

describe("openPlayHours", () => {
  it("expands a session to duration hours (default 2)", () => {
    expect(expandOpenPlaySessionToHourIds({ hour: 7 })).toEqual([
      "07:00",
      "08:00",
    ]);
    expect(
      expandOpenPlaySessionToHourIds({ hour: 16, durationHours: 3 }),
    ).toEqual(["16:00", "17:00", "18:00"]);
  });

  it("covers hours for open-play slot ids", () => {
    expect(coveredHoursForOpenPlaySlotIds(["07:00", "16:00"])).toEqual([
      "07:00",
      "08:00",
      "16:00",
      "17:00",
    ]);
  });

  it("detects hour set overlap", () => {
    expect(hourSetsOverlap(["07:00", "08:00"], ["08:00"])).toBe(true);
    expect(hourSetsOverlap(["07:00"], ["09:00"])).toBe(false);
  });

  it("ships three default sessions", () => {
    expect(DEFAULT_OPEN_PLAY_SESSIONS.map((s) => s.slotId)).toEqual([
      "07:00",
      "16:00",
      "18:00",
    ]);
  });
});
