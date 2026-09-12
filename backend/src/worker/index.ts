import { configureZodErrorMap } from "../lib/zod-error-map.js";
import { logger } from "../app/logger.js";

configureZodErrorMap();
import { closeLogsPool } from "../lib/activity-logs/pool.js";
import { shutdownActivityLogFlusher } from "../lib/activity-logs/flush.js";
import { registerActivityLogsWorker } from "../modules/activity-logs/activity-logs.job.js";
import { registerExampleWorker } from "../modules/examples/examples.job.js";
import { closeRedisConnection } from "../queues/connection.js";

const workers = [registerExampleWorker(), registerActivityLogsWorker()].filter(
  (worker) => worker !== undefined,
);

if (workers.length === 0) {
  logger.info("worker_started_without_redis");
} else {
  logger.info("worker_started", { workerCount: workers.length });
}

async function shutdown(signal: string) {
  logger.info("worker_shutdown_started", { signal });
  await Promise.all(workers.map((worker) => worker.close()));
  await shutdownActivityLogFlusher().catch((error) => {
    logger.warn("activity_logs.flush_shutdown_failed", { error });
  });
  await closeRedisConnection();
  await closeLogsPool().catch((error) => {
    logger.warn("activity_logs.pool_close_failed", { error });
  });
  logger.info("worker_shutdown_complete");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
