import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { captureActivityRecord } from "./flush.js";
import {
  capRedactedJson,
  envelopeActivitySuccessResponse,
  isActivityEnvelopePath,
  isJsonishContentType,
  sanitizeActivityPath,
} from "./redact.js";
import { isActivityLogsHttpPath, isHealthPath, shouldPersistHttpActivity } from "./sampling.js";

function captureOutgoingBody(res: Response): void {
  const originalJson = res.json.bind(res);
  res.json = ((body?: unknown) => {
    res.locals.activityResponseBody = body;
    return originalJson(body);
  }) as typeof res.json;

  const originalSend = res.send.bind(res);
  res.send = ((body?: unknown) => {
    if (res.locals.activityResponseBody === undefined) {
      res.locals.activityResponseBody = body;
    }
    return originalSend(body);
  }) as typeof res.send;
}

/** Parse JSON request bodies for activity capture (includes raw webhook buffers). */
export function parseActivityRequestBody(req: Request): unknown | null {
  if (req.method === "GET" || req.method === "HEAD") return null;
  if (req.body === undefined) return null;

  let body: unknown = req.body;
  if (Buffer.isBuffer(body)) {
    const rawBuffer = body;
    try {
      const text = rawBuffer.toString("utf8").trim();
      if (!text) return null;
      body = JSON.parse(text) as unknown;
    } catch {
      return { _capture: "non_json_binary", byteLength: rawBuffer.length };
    }
  }

  if (
    body !== null &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    Object.keys(body).length === 0
  ) {
    return null;
  }
  return body;
}

function omitBodies(req: Request, res: Response): boolean {
  const reqType = req.headers["content-type"];
  const resType = res.getHeader("content-type");
  const resTypeStr = typeof resType === "string" ? resType : undefined;
  if (reqType && !isJsonishContentType(reqType)) return true;
  if (resTypeStr && !isJsonishContentType(resTypeStr)) return true;
  return false;
}

export function activityHttpCapture(req: Request, res: Response, next: () => void): void {
  const pathGuess = sanitizeActivityPath(req.originalUrl || req.url || req.path || "");
  if (
    isHealthPath(pathGuess) ||
    isActivityLogsHttpPath(pathGuess) ||
    pathGuess === "/favicon.ico" ||
    pathGuess === "/robots.txt"
  ) {
    next();
    return;
  }

  const start = Date.now();
  captureOutgoingBody(res);

  res.on("finish", () => {
    try {
      const path = sanitizeActivityPath(req.originalUrl || req.url || req.path || "");
      const durationMs = Date.now() - start;
      if (!shouldPersistHttpActivity(req, path, res.statusCode, durationMs)) return;

      const skipBodies = omitBodies(req, res);
      let truncated = false;
      let request: unknown = null;
      let response: unknown = null;

      if (!skipBodies) {
        const requestBody = parseActivityRequestBody(req);
        if (requestBody !== null) {
          const capped = capRedactedJson(requestBody);
          request = capped.value;
          truncated = truncated || capped.truncated;
        }
        if (res.locals.activityResponseBody !== undefined) {
          let responseBody: unknown = res.locals.activityResponseBody;
          if (isActivityEnvelopePath(path, req.method) && res.statusCode < 400) {
            responseBody = envelopeActivitySuccessResponse(responseBody);
          }
          const capped = capRedactedJson(responseBody);
          response = capped.value;
          truncated = truncated || capped.truncated;
        }
      }

      captureActivityRecord({
        id: randomUUID(),
        timestamp: new Date(start),
        kind: "http",
        requestId: res.locals.requestId ?? null,
        durationMs,
        truncated,
        method: req.method,
        path,
        statusCode: res.statusCode,
        userId: null,
        role: null,
        remoteAddr: req.ip ?? null,
        userAgent: req.get("user-agent") ?? null,
        request,
        response,
        queue: null,
        jobName: null,
        jobId: null,
        jobStatus: null,
        payload: null,
        error: null,
      });
    } catch {
      /* fail-open */
    }
  });

  next();
}
