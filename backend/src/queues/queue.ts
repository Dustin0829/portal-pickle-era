import { Queue, type JobsOptions } from "bullmq";
import { logger } from "../app/logger.js";
import { buildBullMqJobId } from "../lib/enqueue-job.js";
import { getBullMqConnectionOptions } from "./connection.js";

function resolveJobsOptions(jobName: string, options?: JobsOptions): JobsOptions | undefined {
  if (!options?.jobId?.includes(":")) return options;
  return { ...options, jobId: buildBullMqJobId(jobName) };
}

const queueCache = new Map<string, Queue>();

function getQueue<TPayload extends object>(name: string): Queue<TPayload> | undefined {
  const connection = getBullMqConnectionOptions();
  if (!connection) return undefined;

  const existing = queueCache.get(name);
  if (existing) {
    return existing as Queue<TPayload>;
  }

  const queue = new Queue<TPayload, void, string>(name, { connection });
  queueCache.set(name, queue);
  return queue;
}

export function getRegisteredQueues(): Queue[] {
  return [...queueCache.values()];
}

/** Eagerly instantiate a queue when Redis is configured (for Bull Board at startup). */
export function registerQueueForBoard(name: string): void {
  getQueue(name);
}

export type OptionalQueue<TPayload extends object> = {
  add(name: string, payload: TPayload, options?: JobsOptions): Promise<void>;
};

export function createOptionalQueue<TPayload extends object>(
  name: string,
): OptionalQueue<TPayload> {
  // Eagerly create the Queue when Redis is configured so Bull Board can list it at startup.
  registerQueueForBoard(name);

  return {
    async add(jobName: string, payload: TPayload, options?: JobsOptions) {
      const queue = getQueue<TPayload>(name);
      if (!queue) {
        logger.debug("queue_skipped_no_redis", { queue: name, jobName, payload });
        return;
      }

      try {
        const add = queue.add.bind(queue) as (
          name: string,
          data: TPayload,
          options?: JobsOptions,
        ) => Promise<unknown>;
        await add(jobName, payload, resolveJobsOptions(jobName, options));
      } catch (error) {
        logger.warn("queue_add_failed", { queue: name, jobName, error });
      }
    },
  };
}
