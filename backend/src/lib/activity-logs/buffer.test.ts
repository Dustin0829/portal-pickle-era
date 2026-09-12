import assert from "node:assert/strict";
import test from "node:test";
import {
  activityBufferSize,
  drainActivityRecords,
  pushActivityRecord,
  resetActivityBufferForTests,
} from "./buffer.js";
import type { ActivityLogRecord } from "./types.js";

function sampleRecord(id: string): ActivityLogRecord {
  return {
    id,
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

test("activity buffer push drain and reset", () => {
  resetActivityBufferForTests();
  pushActivityRecord(sampleRecord("a"));
  pushActivityRecord(sampleRecord("b"));
  assert.equal(activityBufferSize(), 2);
  const drained = drainActivityRecords(1);
  assert.equal(drained.length, 1);
  assert.equal(drained[0]?.id, "a");
  assert.equal(activityBufferSize(), 1);
  resetActivityBufferForTests();
  assert.equal(activityBufferSize(), 0);
});
