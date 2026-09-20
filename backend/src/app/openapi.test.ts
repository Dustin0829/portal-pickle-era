import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenApiDocument } from "./openapi.js";

test("OpenAPI document includes v1 template paths", () => {
  const document = buildOpenApiDocument();

  assert.ok(document.paths["/health"]);
  assert.ok(document.paths["/health/db"]);
  assert.ok(document.paths["/examples"]);
  assert.ok(document.paths["/examples/{id}"]);
  assert.ok(document.paths["/uploads/presign"]);
  assert.ok(document.paths["/facility-settings"]);
  assert.ok(document.paths["/admin/facility-settings"]);
  assert.ok(document.paths["/admin/activity-logs"]);
  assert.ok(document.paths["/admin/activity-logs/{id}"]);
});

test("OpenAPI examples list documents pagination query params", () => {
  const document = buildOpenApiDocument();
  const getExamples = document.paths["/examples"]?.get;

  assert.ok(getExamples);
  assert.ok(getExamples.parameters?.some((param) => "name" in param && param.name === "page"));
  assert.ok(getExamples.parameters?.some((param) => "name" in param && param.name === "limit"));
});
