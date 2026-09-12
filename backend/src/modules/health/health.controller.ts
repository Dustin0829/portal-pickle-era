import type { Request, Response } from "express";
import { prisma } from "../../app/prisma.js";
import { sendSuccess } from "../../lib/api-response.js";
import { getRedisConnection } from "../../queues/connection.js";

export function healthController(_req: Request, res: Response) {
  return sendSuccess(res, { status: "ok" });
}

export async function dbHealthController(_req: Request, res: Response) {
  await prisma.$queryRaw`SELECT 1`;

  const redis = getRedisConnection();
  const redisStatus = redis ? await redis.ping() : "skipped";

  return sendSuccess(res, {
    postgres: "ok",
    redis: redisStatus === "PONG" ? "ok" : redisStatus,
  });
}
