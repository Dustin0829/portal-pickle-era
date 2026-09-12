import { describe, expect, it } from "vitest";
import { getExampleListStatus } from "@/lib/examples/exampleListStatus";

describe("getExampleListStatus", () => {
  it("returns empty when no items", () => {
    expect(
      getExampleListStatus({
        isPending: false,
        isError: false,
        items: [],
      }),
    ).toBe("empty");
  });

  it("returns ready when items exist", () => {
    expect(
      getExampleListStatus({
        isPending: false,
        isError: false,
        items: [
          {
            id: "1",
            label: "A",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    ).toBe("ready");
  });
});
