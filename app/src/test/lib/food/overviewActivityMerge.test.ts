import { describe, expect, it } from "vitest";
import { foodOrderStatusLabel } from "@/lib/food/foodOrderStatus";

describe("overview food activity merge helpers", () => {
  it("keeps food status labels aligned with Food tab", () => {
    expect(foodOrderStatusLabel("pending")).toBe("Queued");
  });

  it("sorts mixed activity by createdAt descending", () => {
    const items = [
      { kind: "booking", at: "2026-09-18T10:00:00.000Z", id: "b1" },
      { kind: "food", at: "2026-09-20T08:00:00.000Z", id: "f1" },
      { kind: "booking", at: "2026-09-19T12:00:00.000Z", id: "b2" },
    ];
    const sorted = [...items].sort((a, b) => b.at.localeCompare(a.at));
    expect(sorted.map((item) => item.id)).toEqual(["f1", "b2", "b1"]);
  });
});
