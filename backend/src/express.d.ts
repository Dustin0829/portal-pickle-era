import type { ApiFailure } from "./lib/api-response.js";

declare global {
  namespace Express {
    interface Locals {
      requestId?: string;
      startedAt?: number;
      activityResponseBody?: unknown;
      httpAlertError?: unknown;
      httpAlertResponseBody?: ApiFailure;
    }
  }
}

export {};
