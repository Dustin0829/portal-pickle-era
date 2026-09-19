import { describe, expect, it } from "vitest";
import { appContentPaddingClass } from "@/components/layout/layout.constants";

describe("portal uniform page padding", () => {
  it("keeps Food-tab horizontal padding as the shared token", () => {
    expect(appContentPaddingClass).toBe("px-4 sm:px-6");
  });
});
