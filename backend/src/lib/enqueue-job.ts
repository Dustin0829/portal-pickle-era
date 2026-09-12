import { randomUUID } from "node:crypto";
import { logger } from "../app/logger.js";
import { getBullMqConnectionOptions } from "../queues/connection.js";
import type { Queue } from "bullmq";
import { Queue as BullQueue } from "bullmq";

const queueCache = new Map<string, Queue>();

function getQueue<TPayload extends object>(name: string): Queue<TPayload> | undefined {
  const connection = getBullMqConnectionOptions();
  if (!connection) return undefined;

  const existing = queueCache.get(name);
  if (existing) return existing as Queue<TPayload>;

  const queue = new BullQueue<TPayload, void, string>(name, { connection });
  queueCache.set(name, queue);
  return queue;
}

/** BullMQ rejects custom job ids containing `:`. */
export function buildBullMqJobId(jobName: string): string {
  return `${jobName}-${randomUUID()}`;
}

export async function enqueueOrRunInline<TPayload extends object>(
  queueName: string,
  jobName: string,
  payload: TPayload,
  runInline: () => Promise<void>,
): Promise<"queued" | "inline"> {
  const queue = getQueue<TPayload>(queueName);
  if (queue) {
    const add = queue.add.bind(queue) as (
      name: string,
      data: TPayload,
      options?: { jobId?: string },
    ) => Promise<unknown>;
    try {
      await add(jobName, payload, { jobId: buildBullMqJobId(jobName) });
      return "queued";
    } catch (error) {
      logger.warn("queue_add_failed_fallback_inline", {
        queueName,
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info("job_inline_no_redis", { queueName, jobName });
  await runInline();
  return "inline";
}
