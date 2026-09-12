import type { ConnectionOptions } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../app/env.js";

let connection: Redis | undefined;

export function getRedisConnection(): Redis | undefined {
  if (!env.REDIS_URL) return undefined;
  connection ??= new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
  return connection;
}

export function getBullMqConnectionOptions(): ConnectionOptions | undefined {
  if (!env.REDIS_URL) return undefined;

  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    username: url.username || undefined,
    password: url.password || undefined,
  };
}

export async function closeRedisConnection(): Promise<void> {
  if (!connection) return;
  await connection.quit();
  connection = undefined;
}
