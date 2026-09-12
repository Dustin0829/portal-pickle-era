import { Worker } from "bullmq";
import { logger } from "../../app/logger.js";
import { getBullMqConnectionOptions } from "../../queues/connection.js";

export function register{{Name}}Worker() {
  const connection = getBullMqConnectionOptions();
  if (!connection) {
    logger.info("{{name}}_worker_skipped_no_redis");
    return undefined;
  }

  return new Worker(
    "{{name}}",
    async (job) => {
      logger.info("{{name}}_job_processed", {
        jobId: job.id,
        data: job.data,
      });
    },
    { connection },
  );
}
