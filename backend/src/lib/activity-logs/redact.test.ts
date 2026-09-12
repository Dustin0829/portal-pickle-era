import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVITY_BODY_MAX_BYTES } from "./types.js";
import {
  capRedactedJson,
  compactActivityJson,
  envelopeActivitySuccessResponse,
  isActivityEnvelopePath,
  sanitizeActivityPath,
} from "./redact.js";

test("capRedactedJson redacts secret keys", () => {
  const { value, truncated } = capRedactedJson({
    password: "secret",
    apiToken: "tok",
    authorization: "Bearer x",
    cookie: "sid=1",
    ok: true,
  });
  assert.equal(truncated, false);
  assert.deepEqual(value, {
    password: "[REDACTED]",
    apiToken: "[REDACTED]",
    authorization: "[REDACTED]",
    cookie: "[REDACTED]",
    ok: true,
  });
});

test("capRedactedJson redacts PII keys", () => {
  const { value } = capRedactedJson({
    bio: "ok",
    streetAddress: "123 Main St",
    birthDate: "2001-10-14",
    email: "user@example.com",
    nested: { phoneNumber: "+15551234567" },
  });
  assert.deepEqual(value, {
    bio: "ok",
    streetAddress: "[REDACTED]",
    birthDate: "[REDACTED]",
    email: "[REDACTED]",
    nested: { phoneNumber: "[REDACTED]" },
  });
});

test("capRedactedJson redacts OTP codes but keeps non-OTP error codes", () => {
  const { value } = capRedactedJson({
    email: "user@example.com",
    code: "482910",
    otp: "123456",
    totp: "654321",
    verification_code: "111222",
    error: { code: "otp_invalid", message: "Invalid code" },
  });
  assert.deepEqual(value, {
    email: "[REDACTED]",
    code: "[REDACTED]",
    otp: "[REDACTED]",
    totp: "[REDACTED]",
    verification_code: "[REDACTED]",
    error: { code: "otp_invalid", message: "Invalid code" },
  });
});

test("capRedactedJson redacts webhook signatures", () => {
  const { value } = capRedactedJson({
    event: "invoice.paid",
    customer: { email: "payer@example.com" },
    signature: "abc123signature",
  });
  assert.deepEqual(value, {
    event: "invoice.paid",
    customer: { email: "[REDACTED]" },
    signature: "[REDACTED]",
  });
});

test("capRedactedJson truncates oversized JSON", () => {
  const bulky = Object.fromEntries(
    Array.from({ length: 80 }, (_, i) => [`field${i}`, "x".repeat(300)]),
  );
  const { value, truncated } = capRedactedJson(bulky);
  assert.equal(truncated, true);
  assert.equal((value as { truncated: boolean }).truncated, true);
  assert.ok(typeof (value as { preview: string }).preview === "string");
  assert.ok((value as { preview: string }).preview.length <= ACTIVITY_BODY_MAX_BYTES);
});

test("envelopes successful auth mutation responses", () => {
  assert.equal(isActivityEnvelopePath("/auth/login", "POST"), true);
  assert.equal(isActivityEnvelopePath("/uploads/presign", "POST"), true);
  assert.equal(isActivityEnvelopePath("/examples", "GET"), false);
  assert.deepEqual(
    envelopeActivitySuccessResponse({
      success: true,
      message: "ok",
      data: { email: "secret@example.com", token: "abc" },
    }),
    { success: true, message: "ok" },
  );
});

test("compactActivityJson omits bulky nested dumps", () => {
  const value = compactActivityJson({
    success: true,
    message: "ok",
    data: {
      bio: "This is my bio",
      items: [{ id: "1" }, { id: "2" }],
      intelligence: { evidence: [{ snippet: "long" }] },
    },
  }) as Record<string, unknown>;
  const data = value.data as Record<string, unknown>;
  assert.equal(data.bio, "This is my bio");
  assert.deepEqual(data.items, { omitted: true, type: "array", length: 2 });
  assert.deepEqual(data.intelligence, { omitted: true, type: "object", keys: 1 });
});

test("sanitizeActivityPath strips query when token-like keys are present", () => {
  assert.equal(sanitizeActivityPath("/oauth/callback?code=abc&state=1"), "/oauth/callback");
  assert.equal(sanitizeActivityPath("/examples?page=1"), "/examples");
});
