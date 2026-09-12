import { logger } from "../../app/logger.js";
import { drainActivityRecords, pushActivityRecord } from "./buffer.js";
import { FLUSH_BATCH, FLUSH_MS } from "./types.js";
import type { ActivityLogRecord } from "./types.js";
import { insertActivityRecords } from "./writer.js";

export type ActivityFlushMode = "enqueue" | "insert";

let flushTimer: ReturnType<typeof setInterval> | undefined;
let flushMode: ActivityFlushMode = "enqueue";
let enqueueFn: ((records: ActivityLogRecord[]) => Promise<void>) | undefined;

export function setActivityEnqueueFn(
  fn: ((records: ActivityLogRecord[]) => Promise<void>) | undefined,
): void {
  enqueueFn = fn;
}

export function startActivityLogFlusher(mode: ActivityFlushMode): void {
  flushMode = mode;
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    void flushActivityLogBuffer().catch((err) => {
      logger.warn("activity_logs.flush_failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, FLUSH_MS);
  flushTimer.unref?.();
}

export function captureActivityRecord(record: ActivityLogRecord): void {
  const dropped = pushActivityRecord(record);
  if (dropped) {
    logger.warn("activity_logs.buffer_dropped_oldest");
  }
  if (flushMode === "insert" || enqueueFn) {
    startActivityLogFlusher(flushMode);
  }
}

export async function flushActivityLogBuffer(): Promise<void> {
  const batch = drainActivityRecords(FLUSH_BATCH);
  if (batch.length === 0) return;

  try {
    if (flushMode === "insert") {
      await insertActivityRecords(batch);
      return;
    }
    if (!enqueueFn) {
      logger.warn("activity_logs.enqueue_unavailable_drop", { count: batch.length });
      return;
    }
    await enqueueFn(batch);
  } catch (err) {
    logger.warn("activity_logs.flush_failed", {
      error: err instanceof Error ? err.message : String(err),
      count: batch.length,
    });
  }
}

export async function shutdownActivityLogFlusher(): Promise<void> {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = undefined;
  }
  await flushActivityLogBuffer();
}
