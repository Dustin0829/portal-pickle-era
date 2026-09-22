import { describe, expect, it } from "vitest";
import {
  PICKLE_ERA_FACEBOOK_URL,
  PICKLE_ERA_INSTAGRAM_URL,
} from "@/components/marketing/Footer";

describe("marketing footer social URLs", () => {
  it("points Instagram and Facebook at official Pickle Era profiles", () => {
    expect(PICKLE_ERA_INSTAGRAM_URL).toBe(
      "https://www.instagram.com/pickle.era/",
    );
    expect(PICKLE_ERA_FACEBOOK_URL).toBe(
      "https://www.facebook.com/profile.php?id=61593869870368",
    );
  });
});
