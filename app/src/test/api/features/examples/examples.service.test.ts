import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "@/api/client";
import {
  createExample,
  listExamples,
} from "@/api/features/examples/examples.service";

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe("examples.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists examples from GET /examples", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: "ex-1",
            label: "Hello",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
      meta: {
        page: 1,
        current_page: 1,
        limit: 20,
        items_per_page: 20,
        total: 1,
        total_items: 1,
        total_pages: 1,
      },
    });

    const result = await listExamples();

    expect(mockedApi.get).toHaveBeenCalledWith("/examples", {
      params: { page: 1, limit: 20 },
      signal: undefined,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.label).toBe("Hello");
  });

  it("creates example via POST /examples", async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: "ex-2",
        label: "New",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const result = await createExample({ label: "New" });

    expect(mockedApi.post).toHaveBeenCalledWith("/examples", { label: "New" });
    expect(result.id).toBe("ex-2");
  });
});
