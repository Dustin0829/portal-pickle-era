import { describe, expect, it } from "vitest";
import {
  createWaitlistFormSchema,
  waitlistEntrySchema,
} from "@/api/features/waitlist/waitlist.schema";

describe("waitlist API schemas", () => {
  it("parses create form with join_club source", () => {
    const parsed = createWaitlistFormSchema.parse({
      name: "Ada",
      email: "ada@example.com",
      source: "join_club",
    });
    expect(parsed.email).toBe("ada@example.com");
    expect(parsed.source).toBe("join_club");
  });

  it("rejects invalid email", () => {
    expect(
      createWaitlistFormSchema.safeParse({ email: "not-an-email" }).success,
    ).toBe(false);
  });

  it("parses waitlist entry DTO", () => {
    const entry = waitlistEntrySchema.parse({
      id: "wl_1",
      name: "Ada",
      email: "ada@example.com",
      phone: null,
      source: "newsletter",
      createdAt: "2026-01-15T12:00:00.000Z",
      updatedAt: "2026-01-15T12:00:00.000Z",
    });
    expect(entry.source).toBe("newsletter");
  });
});
