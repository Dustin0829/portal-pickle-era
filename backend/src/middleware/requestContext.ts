import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { runWithRequestContext } from "../lib/observability/context.js";

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header("x-request-id") ?? randomUUID();

  res.locals.requestId = requestId;
  res.locals.startedAt = Date.now();
  res.setHeader("x-request-id", requestId);

  runWithRequestContext(
    {
      requestId,
      method: req.method,
      path: req.path,
    },
    next,
  );
}
