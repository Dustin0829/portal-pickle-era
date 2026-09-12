import assert from "node:assert/strict";
import test from "node:test";
import { wrapJobActivityLog } from "./job-capture.js";
import type { Job } from "bullmq";
import { activityBufferSize, resetActivityBufferForTests } from "./buffer.js";

test("wrapJobActivityLog skips activity-logs queue wrapping", async () => {
  resetActivityBufferForTests();
  let called = false;
  const processor = async (job: Job) => {
    void job;
    called = true;
    return "ok";
  };
  const wrapped = wrapJobActivityLog("activity-logs", processor);
  assert.equal(wrapped, processor);
  await wrapped({ name: "flush", data: {}, id: "1" } as Job);
  assert.equal(called, true);
  assert.equal(activityBufferSize(), 0);
});

test("wrapJobActivityLog records completed jobs fail-open", async () => {
  resetActivityBufferForTests();
  const wrapped = wrapJobActivityLog("examples", async () => ({ ok: true }));
  await wrapped({ name: "created", data: { exampleId: "1" }, id: "job-1" } as Job);
  assert.equal(activityBufferSize(), 1);
});
