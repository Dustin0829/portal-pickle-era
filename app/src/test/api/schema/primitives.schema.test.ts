import { describe, expect, it } from "vitest";
import { nonEmptyString } from "@/api/schema/primitives.schema";

describe("nonEmptyString", () => {
  it("trims and accepts non-empty values", () => {
    expect(nonEmptyString.parse("  hello  ")).toBe("hello");
  });

  it("rejects empty strings", () => {
    expect(() => nonEmptyString.parse("   ")).toThrow();
  });
});
