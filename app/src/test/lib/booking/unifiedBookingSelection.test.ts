import { describe, expect, it } from "vitest";
import {
  EMPTY_UNIFIED_SELECTION,
  applyCourtHourToggle,
  applyOpenPlaySelect,
  preferFromOpenArg,
  toConfirmSelection,
} from "@/lib/booking/unifiedBookingSelection";

describe("unifiedBookingSelection", () => {
  it("maps open prefer and ignores clinic", () => {
    expect(preferFromOpenArg("court")).toBe("court");
    expect(preferFromOpenArg("open-play")).toBe("open-play");
    expect(preferFromOpenArg("clinic")).toBeUndefined();
    expect(preferFromOpenArg()).toBeUndefined();
  });

  it("selects Open Play as open-play plan and clears on re-tap", () => {
    const selected = applyOpenPlaySelect(EMPTY_UNIFIED_SELECTION, "07:00");
    expect(selected).toEqual({
      plan: "open-play",
      courtId: "in-1",
      slotIds: ["07:00"],
    });
    expect(toConfirmSelection("2026-10-05", selected)).toEqual({
      plan: "open-play",
      date: "2026-10-05",
      courtId: "in-1",
      slotIds: ["07:00"],
    });
    expect(applyOpenPlaySelect(selected, "07:00")).toEqual(
      EMPTY_UNIFIED_SELECTION,
    );
  });

  it("replaces Open Play when a court hour is chosen", () => {
    const openPlay = applyOpenPlaySelect(EMPTY_UNIFIED_SELECTION, "07:00");
    const court = applyCourtHourToggle(openPlay, "in-2", "10:00");
    expect(court).toEqual({
      plan: "court",
      courtId: "in-2",
      slotIds: ["10:00"],
    });
  });

  it("allows multi-hour on the same court and resets on court change", () => {
    let selection = applyCourtHourToggle(
      EMPTY_UNIFIED_SELECTION,
      "out-1",
      "09:00",
    );
    selection = applyCourtHourToggle(selection, "out-1", "10:00");
    expect(selection.slotIds).toEqual(["09:00", "10:00"]);
    selection = applyCourtHourToggle(selection, "in-1", "11:00");
    expect(selection).toEqual({
      plan: "court",
      courtId: "in-1",
      slotIds: ["11:00"],
    });
  });

  it("returns null confirm when incomplete", () => {
    expect(
      toConfirmSelection("2026-10-05", EMPTY_UNIFIED_SELECTION),
    ).toBeNull();
  });
});
