import type { Request } from "express";

function pathWithoutQuery(req: Request): string {
  const raw = req.originalUrl || req.url || req.path || "";
  const q = raw.indexOf("?");
  return q === -1 ? raw : raw.slice(0, q);
}

export function shouldSkipHttpRateLimit(req: Request): boolean {
  if (req.method === "OPTIONS") return true;
  if (req.method !== "GET") return false;
  const path = pathWithoutQuery(req);
  if (path === "/health" || path === "/health/db") return true;
  if (path === "/admin/activity-logs" || path.startsWith("/admin/activity-logs/")) return true;
  return false;
}
