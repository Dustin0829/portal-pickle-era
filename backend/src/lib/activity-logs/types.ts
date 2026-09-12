export type ActivityLogKind = "http" | "job";

export type ActivityJobStatus = "completed" | "failed";

export type ActivityLogRecord = {
  id: string;
  timestamp: Date;
  kind: ActivityLogKind;
  requestId: string | null;
  durationMs: number | null;
  truncated: boolean;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  userId: string | null;
  role: string | null;
  remoteAddr: string | null;
  userAgent: string | null;
  request: unknown;
  response: unknown;
  queue: string | null;
  jobName: string | null;
  jobId: string | null;
  jobStatus: ActivityJobStatus | null;
  payload: unknown;
  error: string | null;
};

export type ActivityLogListItem = Omit<ActivityLogRecord, "request" | "response" | "payload">;

export const ACTIVITY_BODY_MAX_BYTES = 16384;
export const BUFFER_MAX = 2000;
export const FLUSH_BATCH = 200;
export const FLUSH_MS = 2000;
export const ACTIVITY_LOGS_UNAVAILABLE_CODE = "ACTIVITY_LOGS_UNAVAILABLE";
