import axios, { type AxiosError } from "axios";
import { getApiBaseUrl } from "@/api/config";
import { sanitizeApiErrorMessage } from "@/api/lib/api-error-message";
import type { ApiErrorBody } from "@/api/types/global.types";
import { shouldMarkRateLimitedOn429 } from "@/lib/network/productQuota429";
import { useRateLimitedStore } from "@/lib/network/rateLimited";

export class ApiRequestError extends Error {
  readonly statusCode?: number;
  readonly code?: string;
  readonly errors?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    errors?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (
      body !== null &&
      typeof body === "object" &&
      "success" in body &&
      (body as { success?: boolean }).success === true &&
      "data" in body
    ) {
      const next = { ...response, data: (body as { data: unknown }).data };
      if ("meta" in body && body.meta != null) {
        (next as { meta?: unknown }).meta = (body as { meta: unknown }).meta;
      }
      return next;
    }
    return response;
  },
  (error: AxiosError<ApiErrorBody>) => {
    const data = error.response?.data;
    const rawMessage =
      data && typeof data === "object" && typeof data.message === "string"
        ? data.message
        : error.message;
    const code =
      data && typeof data === "object" && typeof data.code === "string"
        ? data.code
        : undefined;
    const message = sanitizeApiErrorMessage(
      rawMessage,
      code,
      error.response?.status,
    );
    const errors =
      data && typeof data === "object" && "errors" in data
        ? data.errors
        : undefined;
    if (error.response?.status === 429 && shouldMarkRateLimitedOn429(code)) {
      useRateLimitedStore.getState().markBlocked();
    }
    return Promise.reject(
      new ApiRequestError(message, error.response?.status, code, errors),
    );
  },
);

export default api;
