const SECRET_KEYS = ["password", "token", "secret", "api_key", "apikey", "authorization", "cookie"];

export function isSensitiveAlertBodyPath(path: string): boolean {
  return path.startsWith("/auth") || path.startsWith("/uploads/presign");
}

export function redactAlertPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactAlertPayload(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        SECRET_KEYS.some((secret) => key.toLowerCase().includes(secret))
          ? "[redacted]"
          : redactAlertPayload(nested),
      ]),
    );
  }

  if (typeof value === "string") {
    return value
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
      .replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone]");
  }

  return value;
}
