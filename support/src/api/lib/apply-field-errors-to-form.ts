import { ApiRequestError } from "@/api/client";

/** Zod `flatten()` shape from the backend `ValidationError`. */
export type ApiFlattenedErrors = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Compatible with React Hook Form `setError` without requiring the package at import time. */
export type FormSetFieldError = (
  name: string,
  error: { type?: string; message: string },
) => void;

const VALIDATION_ERROR_CODE = "VALIDATION_ERROR";

export function isApiValidationError(error: unknown): error is ApiRequestError {
  return (
    error instanceof ApiRequestError && error.code === VALIDATION_ERROR_CODE
  );
}

export function parseApiFieldErrors(
  errors: unknown,
): Record<string, string[]> | undefined {
  if (errors === null || typeof errors !== "object") return undefined;

  const fieldErrors = (errors as ApiFlattenedErrors).fieldErrors;
  if (fieldErrors === null || typeof fieldErrors !== "object") return undefined;

  const mapped: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (!Array.isArray(messages)) continue;
    const text = messages.find((m) => typeof m === "string" && m.length > 0);
    if (text) mapped[field] = [text];
  }

  return Object.keys(mapped).length > 0 ? mapped : undefined;
}

/** Maps backend `fieldErrors` into RHF. Returns true when at least one field was set. */
export function applyFieldErrorsToForm(
  errors: unknown,
  setError: FormSetFieldError,
): boolean {
  const fieldErrors = parseApiFieldErrors(errors);
  if (!fieldErrors) return false;

  for (const [field, messages] of Object.entries(fieldErrors)) {
    setError(field, { type: "server", message: messages[0] });
  }

  return true;
}
