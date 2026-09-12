import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../app/env.js";
import { logger } from "../app/logger.js";
import type { ApiFailure } from "../lib/api-response.js";
import type { AppError } from "../lib/errors.js";
import { isAppError, ValidationError } from "../lib/errors.js";
import { emitUnhandledError } from "../lib/observability/events.js";
import { sanitizeValidationError, validationErrorFromZod } from "../lib/zod-validation.js";

function resolveAppError(error: unknown): AppError | null {
  if (error instanceof ZodError) {
    return validationErrorFromZod(error);
  }
  if (error instanceof ValidationError) {
    return sanitizeValidationError(error);
  }
  if (isAppError(error)) {
    return error;
  }
  return null;
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  void next;
  const appError = resolveAppError(error);
  const statusCode = appError ? appError.statusCode : 500;
  const body: ApiFailure = {
    success: false,
    message: appError ? appError.message : "Internal server error",
    ...(appError?.code ? { code: appError.code } : {}),
    ...(appError?.errors !== undefined ? { errors: appError.errors } : {}),
  };

  res.locals.httpAlertError = error;
  res.locals.httpAlertResponseBody = body;

  if (statusCode >= 500) {
    logger.error("request_error", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
    });
    void emitUnhandledError(error, {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
    });
  }

  if (env.NODE_ENV !== "production" && statusCode >= 500 && error instanceof Error) {
    body.errors = { stack: error.stack };
  }

  res.status(statusCode).json(body);
};
