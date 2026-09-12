import { beforeEach, describe, expect, it } from "vitest";
import {
  listWaitlistEntries,
  saveWaitlistEntry,
} from "@/lib/waitlist/waitlistStorage";

describe("waitlistStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("rejects empty email", () => {
    expect(saveWaitlistEntry({ name: "Ada", email: "  " })).toBe(false);
    expect(listWaitlistEntries()).toEqual([]);
  });

  it("upserts by email", () => {
    expect(saveWaitlistEntry({ name: "Ada", email: "ada@example.com" })).toBe(
      true,
    );
    expect(
      saveWaitlistEntry({
        name: "Ada L",
        email: "ADA@example.com",
        phone: "1",
      }),
    ).toBe(true);

    const entries = listWaitlistEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      name: "Ada L",
      email: "ada@example.com",
      phone: "1",
    });
  });
});
