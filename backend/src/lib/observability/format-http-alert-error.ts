import { ValidationError } from "../errors.js";
import { formatFlattenedZodError } from "../format-zod-error.js";
import type { FlattenedZodErrors } from "../format-zod-error.js";
import { isZodDumpMessage } from "../zod-error-map.js";

function flattenedFromValidationErrors(errors: unknown): FlattenedZodErrors | null {
  if (errors === null || typeof errors !== "object") return null;
  const candidate = errors as Partial<FlattenedZodErrors>;
  if (!candidate.fieldErrors || typeof candidate.fieldErrors !== "object") {
    return null;
  }
  const fieldErrors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(candidate.fieldErrors)) {
    if (!Array.isArray(value)) continue;
    fieldErrors[key] = value.filter((message): message is string => typeof message === "string");
  }
  return {
    formErrors: Array.isArray(candidate.formErrors) ? candidate.formErrors : [],
    fieldErrors,
  };
}

export function formatHttpAlertError(error: unknown): string | undefined {
  if (!error) return undefined;

  if (error instanceof ValidationError) {
    const flat = flattenedFromValidationErrors(error.errors);
    if (flat) {
      return formatFlattenedZodError(flat);
    }
  }

  if (error instanceof Error) {
    if (isZodDumpMessage(error.message)) {
      return error.stack ?? "Zod validation failed (see response body fieldErrors)";
    }
    return error.stack ?? error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
