import assert from "node:assert/strict";
import test from "node:test";
import { parseCorsOrigins } from "./env.js";

test("parseCorsOrigins keeps a single origin", () => {
  assert.deepEqual(parseCorsOrigins("http://localhost:5173"), ["http://localhost:5173"]);
});

test("parseCorsOrigins splits comma-separated origins and drops empty entries", () => {
  assert.deepEqual(parseCorsOrigins(" http://localhost:5173, http://localhost:5174 , "), [
    "http://localhost:5173",
    "http://localhost:5174",
  ]);
});
