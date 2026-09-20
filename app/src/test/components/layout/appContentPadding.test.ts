import { describe, expect, it } from "vitest";
import {
  appContentPaddingClass,
  appContentWidthClass,
} from "@/components/layout/layout.constants";

describe("portal uniform page padding", () => {
  it("keeps Food-tab horizontal padding as the shared token", () => {
    expect(appContentPaddingClass).toBe("px-4 sm:px-6");
  });

  it("exposes Dashboard max-w-5xl as the wide shell token", () => {
    expect(appContentWidthClass.wide).toBe("max-w-5xl");
  });
});
