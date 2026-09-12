import { logger } from "../../app/logger.js";
import { getLogsPool } from "./pool.js";
import { ACTIVITY_LOG_INDEX_SQL, ACTIVITY_LOG_SCHEMA_SQL } from "./schema.js";
import type { ActivityLogRecord } from "./types.js";

let schemaReady = false;

export async function applyActivityLogTimescalePolicies(
  query: (sql: string) => Promise<unknown>,
): Promise<void> {
  try {
    await query(
      `SELECT create_hypertable('activity_log', 'timestamp', if_not_exists => TRUE, chunk_time_interval => INTERVAL '1 day')`,
    );
  } catch (err) {
    logger.warn("activity_logs.hypertable_init_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    await query(
      `ALTER TABLE activity_log SET (
        timescaledb.compress,
        timescaledb.compress_orderby = 'timestamp DESC'
      )`,
    );
    await query(
      `SELECT add_compression_policy('activity_log', INTERVAL '7 days', if_not_exists => TRUE)`,
    );
    await query(
      `SELECT add_retention_policy('activity_log', INTERVAL '30 days', if_not_exists => TRUE)`,
    );
  } catch (err) {
    logger.warn("activity_logs.retention_init_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function ensureActivityLogSchema(): Promise<void> {
  const pool = getLogsPool();
  if (!pool || schemaReady) return;

  await pool.query(ACTIVITY_LOG_SCHEMA_SQL);
  await applyActivityLogTimescalePolicies((sql) => pool.query(sql));

  for (const sql of ACTIVITY_LOG_INDEX_SQL) {
    await pool.query(sql);
  }

  schemaReady = true;
}

export async function insertActivityRecords(records: ActivityLogRecord[]): Promise<void> {
  if (records.length === 0) return;
  const pool = getLogsPool();
  if (!pool) return;

  await ensureActivityLogSchema();

  const cols = 21;
  const values: unknown[] = [];
  const placeholders: string[] = [];

  records.forEach((row, i) => {
    const offset = i * cols;
    placeholders.push(
      `(${Array.from({ length: cols }, (_, j) => `$${offset + j + 1}`).join(",")})`,
    );
    values.push(
      row.id,
      row.timestamp,
      row.kind,
      row.requestId,
      row.durationMs,
      row.truncated,
      row.method,
      row.path,
      row.statusCode,
      row.userId,
      row.role,
      row.remoteAddr,
      row.userAgent,
      row.request ?? null,
      row.response ?? null,
      row.queue,
      row.jobName,
      row.jobId,
      row.jobStatus,
      row.payload ?? null,
      row.error,
    );
  });

  await pool.query(
    `INSERT INTO activity_log (
      id, timestamp, kind, request_id, duration_ms, truncated,
      method, path, status_code, user_id, role, remote_addr, user_agent,
      request, response, queue, job_name, job_id, job_status, payload, error
    ) VALUES ${placeholders.join(",")}
    ON CONFLICT (id, timestamp) DO NOTHING`,
    values,
  );
}

/** @internal tests */
export function resetActivityLogSchemaReadyForTests(): void {
  schemaReady = false;
}
