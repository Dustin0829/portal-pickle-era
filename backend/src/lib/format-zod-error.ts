import type { ZodError } from "zod";
import { humanizeZodMessage } from "./zod-error-map.js";

export type FlattenedZodErrors = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};

/**
 * Flatten Zod issues to dot-path field keys (`identitySummary.builds`) for RHF `setError`.
 */
export function flattenZodError(error: ZodError): FlattenedZodErrors {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path =
      issue.path.length > 0 ? issue.path.map((segment) => String(segment)).join(".") : "_root";
    const message = humanizeZodMessage(issue.message);
    const existing = fieldErrors[path];
    fieldErrors[path] = existing ? [...existing, message] : [message];
  }

  const formErrors = fieldErrors._root ? [...fieldErrors._root] : [];
  if (fieldErrors._root) {
    delete fieldErrors._root;
  }

  return { formErrors, fieldErrors };
}

/** Human-readable one-line summary for logs and Discord — not for API `message`. */
export function formatFlattenedZodError(flat: FlattenedZodErrors): string {
  const parts: string[] = [];

  for (const msg of flat.formErrors) {
    if (msg) parts.push(humanizeZodMessage(msg));
  }

  for (const [path, msgs] of Object.entries(flat.fieldErrors)) {
    if (!msgs.length) continue;
    const label = path.replace(/\./g, " › ");
    parts.push(`${label}: ${msgs.map(humanizeZodMessage).join(", ")}`);
  }

  const out = parts.join("; ");
  if (!out) return "Invalid input";
  return out.length > 600 ? `${out.slice(0, 597)}...` : out;
}
