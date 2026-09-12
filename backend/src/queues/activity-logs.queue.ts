import { logger } from "../app/logger.js";
import { createOptionalQueue } from "./queue.js";
import type { ActivityLogRecord } from "../lib/activity-logs/types.js";

export const ACTIVITY_LOGS_QUEUE_NAME = "activity-logs";

export type ActivityLogsJobPayload = {
  records: ActivityLogRecord[];
};

export const activityLogsQueue =
  createOptionalQueue<ActivityLogsJobPayload>(ACTIVITY_LOGS_QUEUE_NAME);

export async function enqueueActivityLogBatchFailOpen(records: ActivityLogRecord[]): Promise<void> {
  if (records.length === 0) return;
  try {
    await activityLogsQueue.add(
      "flush",
      { records },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    );
  } catch (err) {
    logger.warn("activity_logs.enqueue_failed", {
      count: records.length,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
