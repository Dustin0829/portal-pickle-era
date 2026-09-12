import assert from "node:assert/strict";
import test from "node:test";
import { activityLogParamsSchema, listActivityLogsQuerySchema } from "./activity-logs.schema.js";
import { toActivityLogListItemDto } from "./activity-logs.mapper.js";

test("activity logs query requires from/to within 7 days", () => {
  const parsed = listActivityLogsQuerySchema.parse({
    from: "2026-01-01T00:00:00.000Z",
    to: "2026-01-02T00:00:00.000Z",
  });
  assert.equal(parsed.limit, 50);
  assert.equal(parsed.from.toISOString(), "2026-01-01T00:00:00.000Z");
});

test("activity logs query rejects ranges longer than 7 days", () => {
  const result = listActivityLogsQuerySchema.safeParse({
    from: "2026-01-01T00:00:00.000Z",
    to: "2026-01-09T00:00:00.000Z",
  });
  assert.equal(result.success, false);
});

test("activity logs query rejects from after to", () => {
  const result = listActivityLogsQuerySchema.safeParse({
    from: "2026-01-10T00:00:00.000Z",
    to: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(result.success, false);
});

test("activity log params require uuid", () => {
  assert.equal(
    activityLogParamsSchema.safeParse({ id: "00000000-0000-4000-8000-000000000001" }).success,
    true,
  );
  assert.equal(activityLogParamsSchema.safeParse({ id: "not-a-uuid" }).success, false);
});

test("activity log mapper serializes timestamps and omits bodies on list items", () => {
  const dto = toActivityLogListItemDto({
    id: "00000000-0000-4000-8000-000000000001",
    timestamp: new Date("2026-01-15T12:00:00.000Z"),
    kind: "http",
    requestId: null,
    durationMs: 12,
    truncated: false,
    method: "GET",
    path: "/examples",
    statusCode: 200,
    userId: null,
    role: null,
    remoteAddr: null,
    userAgent: null,
    queue: null,
    jobName: null,
    jobId: null,
    jobStatus: null,
    error: null,
  });
  assert.equal(dto.timestamp, "2026-01-15T12:00:00.000Z");
  assert.equal("request" in dto, false);
  assert.equal("response" in dto, false);
  assert.equal("payload" in dto, false);
});
