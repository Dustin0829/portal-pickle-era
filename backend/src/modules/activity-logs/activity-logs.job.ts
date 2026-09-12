import { Worker, type Job } from "bullmq";
import { logger } from "../../app/logger.js";
import { isLogsStoreConfigured } from "../../lib/activity-logs/pool.js";
import { startActivityLogFlusher } from "../../lib/activity-logs/flush.js";
import { ensureActivityLogSchema, insertActivityRecords } from "../../lib/activity-logs/writer.js";
import { getBullMqConnectionOptions } from "../../queues/connection.js";
import {
  ACTIVITY_LOGS_QUEUE_NAME,
  type ActivityLogsJobPayload,
} from "../../queues/activity-logs.queue.js";

export function registerActivityLogsWorker() {
  startActivityLogFlusher("insert");

  const connection = getBullMqConnectionOptions();
  if (!connection) {
    logger.info("activity_logs_worker_skipped_no_redis");
    return undefined;
  }

  void ensureActivityLogSchema().catch((err) => {
    logger.warn("activity_logs.schema_boot_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  });

  return new Worker<ActivityLogsJobPayload>(
    ACTIVITY_LOGS_QUEUE_NAME,
    async (job: Job<ActivityLogsJobPayload>) => {
      if (job.name !== "flush") {
        throw new Error(`Unknown activity-logs job: ${job.name}`);
      }
      if (!isLogsStoreConfigured()) return;
      const records = job.data.records ?? [];
      await insertActivityRecords(
        records.map((row) => ({
          ...row,
          timestamp: new Date(row.timestamp),
        })),
      );
    },
    { connection, concurrency: 2 },
  );
}
