import assert from "node:assert/strict";
import test from "node:test";
import { buildPaginationMeta, pageToOffset, parseSortField } from "./pagination.js";

test("pageToOffset converts a one-based page to a zero-based offset", () => {
  assert.equal(pageToOffset(1, 20), 0);
  assert.equal(pageToOffset(3, 20), 40);
});

test("buildPaginationMeta mirrors frontend pagination field names", () => {
  assert.deepEqual(buildPaginationMeta(2, 10, 25), {
    page: 2,
    current_page: 2,
    limit: 10,
    items_per_page: 10,
    total: 25,
    total_items: 25,
    total_pages: 3,
  });
});

test("parseSortField falls back for unsupported fields", () => {
  const allowed = ["createdAt", "label"] as const;
  assert.equal(parseSortField("label", allowed, "createdAt"), "label");
  assert.equal(parseSortField("bad", allowed, "createdAt"), "createdAt");
});
