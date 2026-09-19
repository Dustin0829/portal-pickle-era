import { describe, expect, it } from "vitest";
import {
  OPEN_PLAY_RESERVED_LABEL,
  resolveCourtHourPresentation,
} from "@/lib/booking/courtSlotPresentation";

describe("courtSlotPresentation", () => {
  it("marks Open Play–held hours as reserved (yellow/black, not selectable)", () => {
    const result = resolveCourtHourPresentation({
      hold: null,
      openPlayHold: true,
      past: false,
      hasCourt: true,
    });
    expect(result.selectable).toBe(false);
    expect(result.reservedForOpenPlay).toBe(true);
    expect(result.label).toBe(OPEN_PLAY_RESERVED_LABEL);
    expect(result.label).toBe("Reserved for Open play");
    expect(result.className).toContain("bg-yellow");
    expect(result.className).toContain("text-black");
  });

  it("lets court hold beat Open Play reserved style", () => {
    const pending = resolveCourtHourPresentation({
      hold: "pending",
      openPlayHold: true,
      past: false,
      hasCourt: true,
    });
    expect(pending.reservedForOpenPlay).toBe(false);
    expect(pending.pending).toBe(true);
    expect(pending.label).toBeNull();
  });

  it("keeps open hours selectable when not blocked by Open Play", () => {
    const result = resolveCourtHourPresentation({
      hold: null,
      openPlayHold: false,
      past: false,
      hasCourt: true,
    });
    expect(result.selectable).toBe(true);
    expect(result.reservedForOpenPlay).toBe(false);
  });
});
