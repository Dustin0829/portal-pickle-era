import { describe, expect, it } from "vitest";
import { initialsFromName } from "@/lib/user/initials";

describe("initialsFromName", () => {
  it("uses the first two words of a full name", () => {
    expect(initialsFromName("Maria Clara Santos", "mc@example.com")).toBe("MC");
  });

  it("uses the first two letters of a single-word name", () => {
    expect(initialsFromName("Pickle", "pickle@example.com")).toBe("PI");
  });

  it("falls back to the email when the name is blank", () => {
    expect(initialsFromName("   ", "admin@example.com")).toBe("AD");
  });

  it("returns a placeholder when both are empty", () => {
    expect(initialsFromName("", "")).toBe("?");
  });
});
