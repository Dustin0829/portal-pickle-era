import { describe, expect, it } from "vitest";
import { bookingTimeRange } from "@/lib/booking/bookingTimeRange";

describe("bookingTimeRange", () => {
  it("formats a single court hour as start–end", () => {
    expect(
      bookingTimeRange({
        plan: "court",
        slotIds: ["06:00"],
      }),
    ).toBe("6:00 AM – 7:00 AM");
  });

  it("formats multi-hour court as min start through last+1", () => {
    expect(
      bookingTimeRange({
        plan: "court",
        slotIds: ["06:00", "07:00"],
      }),
    ).toBe("6:00 AM – 8:00 AM");
  });

  it("uses courtSlots union for multi-court min–max", () => {
    expect(
      bookingTimeRange({
        plan: "court",
        slotIds: ["06:00"],
        courtSlots: [
          { courtId: "in-1", slotIds: ["06:00"] },
          { courtId: "in-2", slotIds: ["08:00"] },
        ],
      }),
    ).toBe("6:00 AM – 9:00 AM");
  });

  it("returns Time TBD when empty", () => {
    expect(bookingTimeRange({ plan: "court", slotIds: [] })).toBe("Time TBD");
  });

  it("lists open-play slot starts", () => {
    expect(
      bookingTimeRange({
        plan: "open-play",
        slotIds: ["18:00", "19:00"],
      }),
    ).toBe("6:00 PM, 7:00 PM");
  });
});
