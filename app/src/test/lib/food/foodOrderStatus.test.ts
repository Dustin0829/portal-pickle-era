import { describe, expect, it } from "vitest";
import { foodOrderStatusLabel } from "@/lib/food/foodOrderStatus";

describe("foodOrderStatusLabel", () => {
  it("maps API statuses to Queued / Preparing / Ready", () => {
    expect(foodOrderStatusLabel("pending")).toBe("Queued");
    expect(foodOrderStatusLabel("preparing")).toBe("Preparing");
    expect(foodOrderStatusLabel("ready")).toBe("Ready");
  });
});
