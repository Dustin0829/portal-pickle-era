import type { Request } from "express";
import { env } from "../../app/env.js";
import { BULL_BOARD_BASE_PATH } from "../../queues/bull-board.js";

function pathWithoutQuery(path: string): string {
  const q = path.indexOf("?");
  return q === -1 ? path : path.slice(0, q);
}

export function isActivityLogsHttpPath(path: string): boolean {
  const normalized = pathWithoutQuery(path);
  return normalized === "/admin/activity-logs" || normalized.startsWith("/admin/activity-logs/");
}

export function isHealthPath(path: string): boolean {
  const normalized = pathWithoutQuery(path);
  return normalized === "/" || normalized === "/health" || normalized === "/health/db";
}

export function isBullBoardPath(path: string): boolean {
  const normalized = pathWithoutQuery(path);
  return normalized === BULL_BOARD_BASE_PATH || normalized.startsWith(`${BULL_BOARD_BASE_PATH}/`);
}

export function slowPersistThresholdMs(): number {
  return env.DISCORD_ALERT_SLOW_MS;
}

const SKIP_EXACT = new Set([
  "/health",
  "/health/db",
  "/docs",
  "/openapi.json",
  "/admin/queues",
  "/favicon.ico",
  "/robots.txt",
]);

/** Early middleware skip — OPTIONS and static/admin noise paths. */
export function shouldSkipHttpActivityCapture(path: string, method: string): boolean {
  if (method.toUpperCase() === "OPTIONS") return true;
  const normalized = pathWithoutQuery(path);
  if (SKIP_EXACT.has(normalized)) return true;
  if (normalized.startsWith("/docs/")) return true;
  if (normalized.startsWith("/admin/queues/")) return true;
  if (isActivityLogsHttpPath(normalized)) return true;
  return false;
}

/** Persist decision on response finish — GET/HEAD only when slow or error. */
export function shouldPersistHttpActivity(
  req: Request,
  path: string,
  status: number,
  durationMs: number,
): boolean {
  if (isHealthPath(path) || path === "/favicon.ico" || path === "/robots.txt") {
    return false;
  }
  if (isActivityLogsHttpPath(path)) return false;
  if (isBullBoardPath(path) && status < 400) return false;

  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD") {
    if (status >= 400) return true;
    return durationMs >= slowPersistThresholdMs();
  }

  return true;
}
