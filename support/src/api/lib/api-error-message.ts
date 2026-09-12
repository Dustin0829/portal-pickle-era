import { ApiRequestError } from "@/api/client";
import {
  applyFieldErrorsToForm,
  isApiValidationError,
  type FormSetFieldError,
} from "@/api/lib/apply-field-errors-to-form";

const VALIDATION_ERROR_CODE = "VALIDATION_ERROR";

/** Raw ZodError.message — never show in UI. */
export function isZodDumpMessage(message: string): boolean {
  const trimmed = message.trim();
  return (
    trimmed.startsWith("ZodError:") ||
    (trimmed.startsWith("[") &&
      trimmed.includes('"code"') &&
      trimmed.includes('"path"'))
  );
}

/** Safe copy for toasts, inline alerts, and read surfaces. */
export function getUserFacingApiErrorMessage(error: unknown): string {
  if (isApiValidationError(error)) {
    return "Check the highlighted fields and try again.";
  }

  if (error instanceof ApiRequestError) {
    if (isZodDumpMessage(error.message)) {
      return error.statusCode && error.statusCode >= 500
        ? "Something went wrong. Try again."
        : "Validation failed. Check your input.";
    }
    if (error.statusCode && error.statusCode >= 500) {
      return "Something went wrong. Try again.";
    }
    return error.message || "Request failed";
  }

  if (error instanceof Error && !isZodDumpMessage(error.message)) {
    return error.message;
  }

  return "Something went wrong. Try again.";
}

/** Normalize API failure messages before they reach ApiRequestError. */
export function sanitizeApiErrorMessage(
  message: string,
  code?: string,
  statusCode?: number,
): string {
  if (code === VALIDATION_ERROR_CODE) {
    return isZodDumpMessage(message) ? "Validation failed" : message;
  }
  if (isZodDumpMessage(message)) {
    return statusCode && statusCode >= 500
      ? "Something went wrong. Try again."
      : "Request failed";
  }
  return message;
}

type HandleApiMutationErrorOptions = {
  setError?: FormSetFieldError;
  toastError?: (message: string) => void;
};

/**
 * Validation → form fields (no toast). Business/system → toast with safe message.
 */
export function handleApiMutationError(
  error: unknown,
  options: HandleApiMutationErrorOptions = {},
): void {
  const { setError, toastError } = options;

  if (isApiValidationError(error)) {
    if (setError && applyFieldErrorsToForm(error.errors, setError)) {
      return;
    }
    return;
  }

  if (toastError) {
    toastError(getUserFacingApiErrorMessage(error));
  }
}
