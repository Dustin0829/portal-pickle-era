import assert from "node:assert/strict";
import test from "node:test";
import { activityBufferSize, pushActivityRecord, resetActivityBufferForTests } from "./buffer.js";
import { flushActivityLogBuffer, setActivityEnqueueFn, startActivityLogFlusher } from "./flush.js";
import type { ActivityLogRecord } from "./types.js";

function sampleRecord(): ActivityLogRecord {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    timestamp: new Date("2026-09-06T00:00:00.000Z"),
    kind: "http",
    requestId: null,
    durationMs: 1,
    truncated: false,
    method: "GET",
    path: "/examples",
    statusCode: 200,
    userId: null,
    role: null,
    remoteAddr: null,
    userAgent: null,
    request: null,
    response: null,
    queue: null,
    jobName: null,
    jobId: null,
    jobStatus: null,
    payload: null,
    error: null,
  };
}

test("flushActivityLogBuffer fail-open does not throw", async () => {
  resetActivityBufferForTests();
  startActivityLogFlusher("enqueue");
  setActivityEnqueueFn(async () => {
    throw new Error("redis down");
  });
  pushActivityRecord(sampleRecord());
  await assert.doesNotReject(() => flushActivityLogBuffer());
  assert.equal(activityBufferSize(), 0);
  setActivityEnqueueFn(undefined);
});
