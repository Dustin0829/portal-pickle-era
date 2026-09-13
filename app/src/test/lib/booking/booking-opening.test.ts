import { describe, expect, it } from "vitest";
import {
  OPENING_DATE,
  dateKey,
  earliestBookableDateKey,
} from "@/lib/booking/booking";

describe("earliestBookableDateKey", () => {
  it("returns opening date before courts open", () => {
    expect(earliestBookableDateKey(new Date("2026-09-13T12:00:00"))).toBe(
      OPENING_DATE,
    );
  });

  it("returns today once opening day has arrived", () => {
    const afterOpen = new Date("2026-10-20T12:00:00");
    expect(earliestBookableDateKey(afterOpen)).toBe(dateKey(afterOpen));
  });

  it("keeps opening day selectable on opening day", () => {
    expect(earliestBookableDateKey(new Date("2026-10-05T08:00:00"))).toBe(
      OPENING_DATE,
    );
  });
});
