import type { ActivityLogListItem, ActivityLogRecord } from "../../lib/activity-logs/types.js";
import type { ActivityLogDetailDto, ActivityLogListItemDto } from "./activity-logs.schema.js";

function toListFields(row: ActivityLogListItem): ActivityLogListItemDto {
  return {
    id: row.id,
    timestamp: row.timestamp.toISOString(),
    kind: row.kind,
    requestId: row.requestId,
    durationMs: row.durationMs,
    truncated: row.truncated,
    method: row.method,
    path: row.path,
    statusCode: row.statusCode,
    userId: row.userId,
    role: row.role,
    remoteAddr: row.remoteAddr,
    userAgent: row.userAgent,
    queue: row.queue,
    jobName: row.jobName,
    jobId: row.jobId,
    jobStatus: row.jobStatus,
    error: row.error,
  };
}

export function toActivityLogListItemDto(row: ActivityLogListItem): ActivityLogListItemDto {
  return toListFields(row);
}

export function toActivityLogDetailDto(row: ActivityLogRecord): ActivityLogDetailDto {
  return {
    ...toListFields(row),
    request: row.request ?? null,
    response: row.response ?? null,
    payload: row.payload ?? null,
  };
}
