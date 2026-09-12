import type { ZodError } from "zod";
import { ValidationError } from "./errors.js";
import { flattenZodError } from "./format-zod-error.js";
import { isZodDumpMessage } from "./zod-error-map.js";

const VALIDATION_MESSAGE = "Validation failed";

/** Use at HTTP boundaries and in services (LLM output, internal parses). */
export function validationErrorFromZod(error: ZodError): ValidationError {
  return new ValidationError(VALIDATION_MESSAGE, flattenZodError(error));
}

/** Normalize leaked Zod dumps on ValidationError.message. */
export function sanitizeValidationError(error: ValidationError): ValidationError {
  if (!isZodDumpMessage(error.message)) {
    return error;
  }
  return new ValidationError(VALIDATION_MESSAGE, error.errors);
}
