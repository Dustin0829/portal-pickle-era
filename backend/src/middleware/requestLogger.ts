import type { NextFunction, Request, Response } from "express";
import { logger } from "../app/logger.js";
import { maybeAlertHttpResponse } from "../lib/observability/http-discord-alerts.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const durationMs = Date.now() - (res.locals.startedAt ?? Date.now());

    logger.info("request_finished", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });

    void maybeAlertHttpResponse(req, res, durationMs);
  });

  next();
}
