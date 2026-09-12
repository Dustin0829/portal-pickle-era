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

  it("normalizes corrupt stored rows without crashing", () => {
    localStorage.setItem(
      "pickle-era-waitlist",
      JSON.stringify([
        { email: "ok@example.com", name: "Ok" },
        { email: "  ", name: "Bad" },
        null,
        { email: "phone@example.com", phone: "09" },
      ]),
    );

    const entries = listWaitlistEntries();
    expect(entries).toHaveLength(2);
    expect(entries.map((item) => item.email).sort()).toEqual([
      "ok@example.com",
      "phone@example.com",
    ]);
    expect(entries.every((item) => typeof item.joinedAt === "string")).toBe(
      true,
    );
  });
});
