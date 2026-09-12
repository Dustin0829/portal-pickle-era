import assert from "node:assert/strict";
import test from "node:test";
import {
  createExampleBodySchema,
  exampleParamsSchema,
  listExamplesQuerySchema,
} from "./examples.schema.js";

test("examples schema parses paginated list query", () => {
  const parsed = listExamplesQuerySchema.parse({
    page: "2",
    limit: "10",
    sort: "label",
    order: "asc",
    search: "launch",
  });

  assert.equal(parsed.page, 2);
  assert.equal(parsed.limit, 10);
  assert.equal(parsed.sort, "label");
  assert.equal(parsed.order, "asc");
});

test("examples schema rejects unsupported sort fields", () => {
  assert.equal(listExamplesQuerySchema.safeParse({ sort: "id" }).success, false);
});

test("examples schema rejects search shorter than 2 characters", () => {
  assert.equal(listExamplesQuerySchema.safeParse({ search: "a" }).success, false);
});

test("examples mapper serializes createdAt to ISO string", async () => {
  const { toExampleDto } = await import("./examples.mapper.js");
  const dto = toExampleDto({
    id: "ex_1",
    label: "Test",
    createdAt: new Date("2026-01-15T12:00:00.000Z"),
  });
  assert.equal(dto.createdAt, "2026-01-15T12:00:00.000Z");
  assert.equal(dto.label, "Test");
});

test("examples schema validates create body and route params", () => {
  assert.deepEqual(createExampleBodySchema.parse({ label: "New example" }), {
    label: "New example",
  });
  assert.deepEqual(exampleParamsSchema.parse({ id: "abc" }), { id: "abc" });
});
