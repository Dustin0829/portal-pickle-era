import { env } from "../../app/env.js";

import { BULL_BOARD_BASE_PATH } from "../../queues/bull-board.js";

const PRODUCTION_4XX_SKIP = [400, 403, 404, 409, 422] as const;
const HEALTH_PATHS = new Set([
  "/",
  "/health",
  "/health/",
  "/health/db",
  "/openapi.json",
  "/docs",
  BULL_BOARD_BASE_PATH,
]);

export function isAlertExcludedPath(path: string): boolean {
  return (
    HEALTH_PATHS.has(path) ||
    path.startsWith("/docs/") ||
    path.startsWith(`${BULL_BOARD_BASE_PATH}/`)
  );
}

export function shouldAlertHttp4xxForEnv(input: {
  status: number;
  nodeEnv: "development" | "test" | "production";
}): boolean {
  const { status, nodeEnv } = input;
  if (status < 400 || status >= 500) return false;
  if (status === 401) return false;

  if (nodeEnv === "development") return true;

  return !PRODUCTION_4XX_SKIP.includes(status as (typeof PRODUCTION_4XX_SKIP)[number]);
}

export function shouldAlertHttp4xx(status: number): boolean {
  return shouldAlertHttp4xxForEnv({
    status,
    nodeEnv: env.NODE_ENV,
  });
}

export function getHttpAlertKind(
  status: number,
  durationMs: number,
): "4xx" | "5xx" | "slow" | undefined {
  if (status >= 500) return "5xx";
  if (shouldAlertHttp4xx(status)) return "4xx";
  if (status < 400 && durationMs >= env.DISCORD_ALERT_SLOW_MS) return "slow";
  return undefined;
}
