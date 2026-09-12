import assert from "node:assert/strict";
import { test } from "node:test";
import { buildBullMqJobId } from "./enqueue-job.js";

test("buildBullMqJobId avoids colons for BullMQ compatibility", () => {
  const id = buildBullMqJobId("created");
  assert.match(id, /^created-/);
  assert.equal(id.includes(":"), false);
});
