import assert from "node:assert/strict";
import test from "node:test";
import {
  isResendConfigured,
  resolvePublicAppUrl,
  sendBookingPaymentReceivedEmail,
  sendEmail,
  sendPasswordResetEmail,
  sendPlayerInviteEmail,
} from "./client.js";

test("isResendConfigured is false when env unset (local default)", () => {
  assert.equal(isResendConfigured(), false);
});

test("resolvePublicAppUrl falls back to first CORS origin when PUBLIC_APP_URL unset", () => {
  const url = resolvePublicAppUrl();
  assert.ok(url.startsWith("http"));
  assert.equal(url.endsWith("/"), false);
});

test("sendEmail skips without throwing when Resend env unset", async () => {
  const result = await sendEmail({
    to: "player@example.com",
    subject: "Test",
    html: "<p>hi</p>",
  });
  assert.equal(result.sent, false);
  if (!result.sent) {
    assert.equal(result.reason, "not_configured");
    assert.match(result.message, /RESEND_API_KEY|EMAIL_FROM/);
  }
});

test("sendBookingPaymentReceivedEmail skips without throwing when Resend env unset", async () => {
  const result = await sendBookingPaymentReceivedEmail({
    to: "player@example.com",
    name: "Ada",
    date: "2026-10-05",
    referenceId: "GCASH-1",
  });
  assert.equal(result.sent, false);
  if (!result.sent) {
    assert.equal(result.reason, "not_configured");
  }
});

test("sendPasswordResetEmail skips without throwing when Resend env unset", async () => {
  const result = await sendPasswordResetEmail({
    to: "player@example.com",
    token: "reset-token-abc",
  });
  assert.equal(result.sent, false);
  if (!result.sent) {
    assert.equal(result.reason, "not_configured");
  }
});

test("password reset SPA link shape uses PUBLIC_APP_URL fallback + encoded token", () => {
  const portal = resolvePublicAppUrl();
  const token = "tok+/=xyz";
  const resetUrl = `${portal}/reset-password?token=${encodeURIComponent(token)}`;
  assert.equal(resetUrl.includes("/reset-password?token="), true);
  assert.equal(resetUrl.includes(encodeURIComponent(token)), true);
  assert.equal(resetUrl.endsWith("/"), false);
});

test("sendPlayerInviteEmail skips without throwing when Resend env unset", async () => {
  const result = await sendPlayerInviteEmail({
    to: "player@example.com",
    tempPassword: "temp-pass-1",
  });
  assert.equal(result.sent, false);
  if (!result.sent) {
    assert.equal(result.reason, "not_configured");
  }
});
