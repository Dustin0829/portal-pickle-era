import type { ApiFailure } from "./lib/api-response.js";
import type { AuthUser } from "./modules/auth/auth.constants.js";

declare global {
  namespace Express {
    interface Locals {
      requestId?: string;
      startedAt?: number;
      activityResponseBody?: unknown;
      httpAlertError?: unknown;
      httpAlertResponseBody?: ApiFailure;
    }

    interface Request {
      authUser?: AuthUser;
    }
  }
}

export {};
