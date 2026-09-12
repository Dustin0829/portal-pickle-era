import { createServer } from "node:http";
import { configureZodErrorMap } from "./lib/zod-error-map.js";

configureZodErrorMap();

import { createApp } from "./app/app.js";
import { env } from "./app/env.js";
import { logger } from "./app/logger.js";
import { prisma } from "./app/prisma.js";
import { closeLogsPool } from "./lib/activity-logs/pool.js";
import { ensureActivityLogSchema } from "./lib/activity-logs/writer.js";
import {
  setActivityEnqueueFn,
  shutdownActivityLogFlusher,
  startActivityLogFlusher,
} from "./lib/activity-logs/flush.js";
import { enqueueActivityLogBatchFailOpen } from "./queues/activity-logs.queue.js";
import { closeRedisConnection } from "./queues/connection.js";

setActivityEnqueueFn(enqueueActivityLogBatchFailOpen);
startActivityLogFlusher("enqueue");
void ensureActivityLogSchema().catch((err) => {
  logger.warn("activity_logs.schema_boot_failed", {
    error: err instanceof Error ? err.message : String(err),
  });
});

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info("server_started", {
    port: env.PORT,
    mode: env.NODE_ENV,
  });
});

async function shutdown(signal: string) {
  logger.info("server_shutdown_started", { signal });
  server.close(async () => {
    await shutdownActivityLogFlusher().catch((error) => {
      logger.warn("activity_logs.flush_shutdown_failed", { error });
    });
    await prisma.$disconnect();
    await closeRedisConnection();
    await closeLogsPool().catch((error) => {
      logger.warn("activity_logs.pool_close_failed", { error });
    });
    logger.info("server_shutdown_complete");
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
