import assert from "node:assert/strict";
import test from "node:test";
import { paginatedQuerySchema } from "./pagination.schema.js";

test("paginatedQuerySchema applies defaults", () => {
  const parsed = paginatedQuerySchema.parse({});

  assert.equal(parsed.page, 1);
  assert.equal(parsed.limit, 20);
  assert.equal(parsed.order, "desc");
});

test("paginatedQuerySchema caps limit", () => {
  const parsed = paginatedQuerySchema.safeParse({ limit: "101" });
  assert.equal(parsed.success, false);
});
