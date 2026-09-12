import { AppError, NotFoundError, ServiceUnavailableError, ValidationError } from "../errors.js";
import { buildPaginationMeta, pageToOffset } from "../pagination.js";
import { getLogsPool, isLogsStoreConfigured } from "./pool.js";
import { ACTIVITY_LOGS_UNAVAILABLE_CODE } from "./types.js";
import type { ActivityLogKind, ActivityLogListItem, ActivityLogRecord } from "./types.js";

export const ACTIVITY_LOG_MAX_RANGE_MS = 7 * 24 * 60 * 60 * 1000;

export type ListActivityLogsQuery = {
  page: number;
  limit: number;
  from: Date;
  to: Date;
  kind?: ActivityLogKind | undefined;
  method?: string | undefined;
  status_class?: "2xx" | "3xx" | "4xx" | "5xx" | undefined;
  path_contains?: string | undefined;
  user_id?: string | undefined;
  queue?: string | undefined;
  job_name?: string | undefined;
  job_status?: "completed" | "failed" | undefined;
};

export function assertActivityLogTimeRange(from: Date, to: Date): void {
  if (from.getTime() > to.getTime()) {
    throw new ValidationError("from must be before to");
  }
  if (to.getTime() - from.getTime() > ACTIVITY_LOG_MAX_RANGE_MS) {
    throw new ValidationError("Time range must be at most 7 days");
  }
}

function requirePool() {
  const pool = getLogsPool();
  if (!pool || !isLogsStoreConfigured()) {
    throw new ServiceUnavailableError(
      "Activity log store is unavailable",
      ACTIVITY_LOGS_UNAVAILABLE_CODE,
    );
  }
  return pool;
}

function rethrowLogsStoreError(err: unknown): never {
  if (err instanceof AppError) throw err;
  throw new ServiceUnavailableError(
    "Activity log store is unavailable",
    ACTIVITY_LOGS_UNAVAILABLE_CODE,
  );
}

function mapRow(row: Record<string, unknown>, includeBodies: boolean): ActivityLogRecord {
  return {
    id: String(row.id),
    timestamp: new Date(String(row.timestamp)),
    kind: row.kind as ActivityLogKind,
    requestId: row.request_id ? String(row.request_id) : null,
    durationMs: row.duration_ms == null ? null : Number(row.duration_ms),
    truncated: Boolean(row.truncated),
    method: row.method ? String(row.method) : null,
    path: row.path ? String(row.path) : null,
    statusCode: row.status_code == null ? null : Number(row.status_code),
    userId: row.user_id ? String(row.user_id) : null,
    role: row.role ? String(row.role) : null,
    remoteAddr: row.remote_addr ? String(row.remote_addr) : null,
    userAgent: row.user_agent ? String(row.user_agent) : null,
    request: includeBodies ? (row.request ?? null) : null,
    response: includeBodies ? (row.response ?? null) : null,
    queue: row.queue ? String(row.queue) : null,
    jobName: row.job_name ? String(row.job_name) : null,
    jobId: row.job_id ? String(row.job_id) : null,
    jobStatus: row.job_status ? (row.job_status as ActivityLogRecord["jobStatus"]) : null,
    payload: includeBodies ? (row.payload ?? null) : null,
    error: row.error ? String(row.error) : null,
  };
}

function toListItem(record: ActivityLogRecord): ActivityLogListItem {
  return {
    id: record.id,
    timestamp: record.timestamp,
    kind: record.kind,
    requestId: record.requestId,
    durationMs: record.durationMs,
    truncated: record.truncated,
    method: record.method,
    path: record.path,
    statusCode: record.statusCode,
    userId: record.userId,
    role: record.role,
    remoteAddr: record.remoteAddr,
    userAgent: record.userAgent,
    queue: record.queue,
    jobName: record.jobName,
    jobId: record.jobId,
    jobStatus: record.jobStatus,
    error: record.error,
  };
}

export async function listActivityLogs(query: ListActivityLogsQuery): Promise<{
  items: ActivityLogListItem[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const pool = requirePool();
  assertActivityLogTimeRange(query.from, query.to);

  const where: string[] = [`timestamp >= $1`, `timestamp <= $2`];
  const params: unknown[] = [query.from, query.to];
  let i = 3;

  if (query.kind) {
    where.push(`kind = $${i++}`);
    params.push(query.kind);
  }
  if (query.method) {
    where.push(`method = $${i++}`);
    params.push(query.method);
  }
  if (query.status_class) {
    const min = Number(query.status_class[0]) * 100;
    where.push(`status_code >= $${i++} AND status_code < $${i++}`);
    params.push(min, min + 100);
  }
  if (query.path_contains) {
    where.push(`path ILIKE $${i++}`);
    params.push(`%${query.path_contains}%`);
  }
  if (query.user_id) {
    where.push(`user_id = $${i++}`);
    params.push(query.user_id);
  }
  if (query.queue) {
    where.push(`queue = $${i++}`);
    params.push(query.queue);
  }
  if (query.job_name) {
    where.push(`job_name ILIKE $${i++}`);
    params.push(`%${query.job_name}%`);
  }
  if (query.job_status) {
    where.push(`job_status = $${i++}`);
    params.push(query.job_status);
  }

  const whereSql = where.join(" AND ");
  try {
    const countRes = await pool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM activity_log WHERE ${whereSql}`,
      params,
    );
    const total = Number(countRes.rows[0]?.count ?? 0);
    const offset = pageToOffset(query.page, query.limit);
    const limitPlaceholder = params.length + 1;
    params.push(query.limit);
    const offsetPlaceholder = params.length + 1;
    params.push(offset);

    const listRes = await pool.query(
      `SELECT id, timestamp, kind, request_id, duration_ms, truncated,
            method, path, status_code, user_id, role, remote_addr, user_agent,
            queue, job_name, job_id, job_status, error
     FROM activity_log
     WHERE ${whereSql}
     ORDER BY timestamp DESC
     LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`,
      params,
    );

    return {
      items: listRes.rows.map((row) => toListItem(mapRow(row as Record<string, unknown>, false))),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  } catch (err) {
    rethrowLogsStoreError(err);
  }
}

export async function getActivityLog(id: string): Promise<ActivityLogRecord> {
  const pool = requirePool();
  try {
    const result = await pool.query(`SELECT * FROM activity_log WHERE id = $1 LIMIT 1`, [id]);
    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) throw new NotFoundError("Activity log not found");
    return mapRow(row, true);
  } catch (err) {
    rethrowLogsStoreError(err);
  }
}
