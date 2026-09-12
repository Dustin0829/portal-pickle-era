import { randomUUID } from "node:crypto";
import type { Job } from "bullmq";
import { getRequestContext } from "../observability/context.js";
import { captureActivityRecord } from "./flush.js";
import { capRedactedJson } from "./redact.js";

const ACTIVITY_LOGS_QUEUE_NAME = "activity-logs";

export function shouldPersistJobActivity(
  queueName: string,
  jobStatus: "completed" | "failed",
): boolean {
  if (jobStatus === "failed") return true;
  if (queueName === ACTIVITY_LOGS_QUEUE_NAME) return false;
  return true;
}

export function wrapJobActivityLog<T>(
  queueName: string,
  processor: (job: Job<T>) => Promise<unknown>,
): (job: Job<T>) => Promise<unknown> {
  if (queueName === ACTIVITY_LOGS_QUEUE_NAME) return processor;

  return async (job: Job<T>) => {
    const start = Date.now();
    try {
      const result = await processor(job);
      recordJobActivityIfNeeded(queueName, job, Date.now() - start, "completed", null, result);
      return result;
    } catch (err) {
      recordJobActivityIfNeeded(
        queueName,
        job,
        Date.now() - start,
        "failed",
        err instanceof Error ? err.message : String(err),
      );
      throw err;
    }
  };
}

function recordJobActivityIfNeeded(
  queueName: string,
  job: Job,
  durationMs: number,
  status: "completed" | "failed",
  error: string | null,
  result?: unknown,
): void {
  if (!shouldPersistJobActivity(queueName, status)) return;
  recordJobActivity(queueName, job, durationMs, status, error, result);
}

function recordJobActivity(
  queueName: string,
  job: Job,
  durationMs: number,
  status: "completed" | "failed",
  error: string | null,
  result?: unknown,
): void {
  try {
    const capped = capRedactedJson(result ?? job.data);
    const ctx = getRequestContext();
    captureActivityRecord({
      id: randomUUID(),
      timestamp: new Date(),
      kind: "job",
      requestId: ctx?.requestId ?? null,
      durationMs,
      truncated: capped.truncated,
      method: null,
      path: null,
      statusCode: null,
      userId: null,
      role: null,
      remoteAddr: null,
      userAgent: null,
      request: null,
      response: null,
      queue: queueName,
      jobName: job.name,
      jobId: job.id ?? null,
      jobStatus: status,
      payload: capped.value,
      error,
    });
  } catch {
    /* fail-open */
  }
}
