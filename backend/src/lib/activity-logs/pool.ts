import pg from "pg";
import { env } from "../../app/env.js";
import { logger } from "../../app/logger.js";

const globalForLogs = globalThis as unknown as { logsPool?: pg.Pool | undefined };

export function isLogsStoreConfigured(): boolean {
  return Boolean(env.LOGS_DATABASE_URL);
}

export function getLogsPool(): pg.Pool | undefined {
  if (!env.LOGS_DATABASE_URL) return undefined;
  if (globalForLogs.logsPool) return globalForLogs.logsPool;
  const pool = new pg.Pool({
    connectionString: env.LOGS_DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on("error", (err) => {
    logger.warn("activity_logs.pool.error", { error: err.message });
  });
  globalForLogs.logsPool = pool;
  return pool;
}

export async function closeLogsPool(): Promise<void> {
  const pool = globalForLogs.logsPool;
  if (!pool) return;
  globalForLogs.logsPool = undefined;
  await pool.end();
}
