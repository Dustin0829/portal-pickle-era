import { Worker } from "bullmq";
import { logger } from "../../app/logger.js";
import { wrapJobActivityLog } from "../../lib/activity-logs/job-capture.js";
import { getBullMqConnectionOptions } from "../../queues/connection.js";
import type { ExampleCreatedJob } from "./examples.queue.js";

export function registerExampleWorker() {
  const connection = getBullMqConnectionOptions();
  if (!connection) {
    logger.info("example_worker_skipped_no_redis");
    return undefined;
  }

  return new Worker<ExampleCreatedJob>(
    "examples",
    wrapJobActivityLog("examples", async (job) => {
      logger.info("example_job_processed", {
        jobId: job.id,
        exampleId: job.data.exampleId,
      });
    }),
    { connection },
  );
}
