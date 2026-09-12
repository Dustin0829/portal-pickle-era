import { describe, expect, it } from "vitest";
import { createExampleFormSchema } from "@/api/features/examples/examples.schema";

describe("createExampleFormSchema", () => {
  it("rejects empty label", () => {
    expect(createExampleFormSchema.safeParse({ label: "" }).success).toBe(
      false,
    );
  });

  it("accepts valid label", () => {
    const parsed = createExampleFormSchema.parse({ label: "Hello" });
    expect(parsed.label).toBe("Hello");
  });
});
