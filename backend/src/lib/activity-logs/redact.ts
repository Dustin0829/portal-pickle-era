import { redactAlertPayload } from "../observability/alert-payload-redact.js";
import { ACTIVITY_BODY_MAX_BYTES } from "./types.js";

/** Extend when new high-PII fields ship in product APIs. */
const PII_KEYS = new Set([
  "birthdate",
  "age",
  "gender",
  "streetaddress",
  "phonenumber",
  "phone",
  "email",
  "confirmemail",
  "accountnumber",
  "accountname",
  "accountholdername",
  "firstname",
  "lastname",
  "fullname",
  "displayname",
]);

/** OTP/TOTP code fields on the activity persist path. */
const OTP_CODE_KEYS = new Set(["totp", "otp", "verificationcode"]);

/** Vendor webhook / callback fields not covered by generic secret redact. */
const ACTIVITY_SECRET_KEYS = new Set(["signature", "callbacktoken"]);

function activityRedactKey(key: string): string {
  return key.toLowerCase().replace(/_/g, "");
}

function looksLikeOtpCode(value: unknown): boolean {
  return typeof value === "string" && /^\d{4,8}$/.test(value.trim());
}

const OMITTED_OBJECT_KEYS = new Set([
  "intelligence",
  "evidence",
  "items",
  "snippets",
  "ratingBreakdown",
]);

const MAX_COMPACT_DEPTH = 5;
const MAX_STRING_CHARS = 280;
const MAX_ARRAY_ITEMS = 6;

function summarizeOmitted(value: unknown): unknown {
  if (Array.isArray(value)) {
    return { omitted: true, type: "array", length: value.length };
  }
  if (value && typeof value === "object") {
    return { omitted: true, type: "object", keys: Object.keys(value).length };
  }
  return value;
}

/** Drop bulky nested dumps so activity bodies stay readable. */
export function compactActivityJson(value: unknown, depth = 0): unknown {
  if (value == null || typeof value !== "object") {
    if (typeof value === "string" && value.length > MAX_STRING_CHARS) {
      return `${value.slice(0, MAX_STRING_CHARS)}…`;
    }
    return value;
  }
  if (depth >= MAX_COMPACT_DEPTH) return summarizeOmitted(value);

  if (Array.isArray(value)) {
    const mapped = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => compactActivityJson(item, depth + 1));
    if (value.length > MAX_ARRAY_ITEMS) {
      mapped.push({
        omitted: true,
        type: "array_tail",
        length: value.length - MAX_ARRAY_ITEMS,
      });
    }
    return mapped;
  }

  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    out[key] = OMITTED_OBJECT_KEYS.has(key)
      ? summarizeOmitted(child)
      : compactActivityJson(child, depth + 1);
  }
  return out;
}

function redactActivityPii(value: unknown): unknown {
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redactActivityPii);

  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const keyNorm = activityRedactKey(key);
    if (PII_KEYS.has(keyNorm) || ACTIVITY_SECRET_KEYS.has(keyNorm)) {
      out[key] = "[REDACTED]";
    } else if (OTP_CODE_KEYS.has(keyNorm) || (keyNorm === "code" && looksLikeOtpCode(child))) {
      out[key] = "[REDACTED]";
    } else {
      out[key] = redactActivityPii(child);
    }
  }
  return out;
}

/** Activity logs use a single redaction marker for readability in the support UI. */
function normalizeActivityRedactionMarkers(value: unknown): unknown {
  if (typeof value === "string") {
    if (
      value === "[REDACTED_EMAIL]" ||
      value === "[REDACTED_PHONE]" ||
      value === "[email]" ||
      value === "[phone]" ||
      value === "[redacted]"
    ) {
      return "[REDACTED]";
    }
    return value;
  }
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(normalizeActivityRedactionMarkers);

  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    out[key] = normalizeActivityRedactionMarkers(child);
  }
  return out;
}

/**
 * High-PII 2xx paths store envelope only — not the full resource DTO.
 * Extend when product routes return identity or payment payloads.
 */
export function isActivityEnvelopePath(path: string, method: string): boolean {
  if (path.startsWith("/auth/") && method.toUpperCase() !== "GET") return true;
  if (path.startsWith("/uploads/presign")) return true;
  return false;
}

export function envelopeActivitySuccessResponse(body: unknown): unknown {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return { success: true };
  }
  const rec = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if ("success" in rec) out.success = rec.success;
  if ("message" in rec) out.message = rec.message;
  if (typeof rec.code === "string") out.code = rec.code;
  if (Object.keys(out).length === 0) return { success: true };
  return out;
}

export function capRedactedJson(value: unknown): { value: unknown; truncated: boolean } {
  const compacted = compactActivityJson(
    normalizeActivityRedactionMarkers(redactActivityPii(redactAlertPayload(value))),
  );
  let text: string;
  try {
    text = JSON.stringify(compacted);
  } catch {
    return { value: "[UNSERIALIZABLE]", truncated: true };
  }
  if (text.length <= ACTIVITY_BODY_MAX_BYTES) {
    return { value: compacted, truncated: false };
  }
  return {
    value: { truncated: true, preview: text.slice(0, ACTIVITY_BODY_MAX_BYTES) },
    truncated: true,
  };
}

const SECRET_QUERY_KEYS = new Set(["code", "token", "access_token", "refresh_token", "id_token"]);

/** Path only — strip query; never persist raw OAuth/token query values. */
export function sanitizeActivityPath(originalUrl: string): string {
  const q = originalUrl.indexOf("?");
  const path = q === -1 ? originalUrl : originalUrl.slice(0, q);
  if (q === -1) return path;
  try {
    const params = new URLSearchParams(originalUrl.slice(q + 1));
    for (const key of params.keys()) {
      if (SECRET_QUERY_KEYS.has(key.toLowerCase())) {
        return path;
      }
    }
  } catch {
    return path;
  }
  return path;
}

export function isJsonishContentType(contentType: string | undefined): boolean {
  if (!contentType) return true;
  const lower = contentType.toLowerCase();
  if (lower.includes("multipart/")) return false;
  if (lower.includes("octet-stream")) return false;
  if (lower.includes("image/") || lower.includes("video/") || lower.includes("audio/")) {
    return false;
  }
  return (
    lower.includes("json") ||
    lower.includes("text/") ||
    lower.includes("xml") ||
    lower.includes("javascript")
  );
}
