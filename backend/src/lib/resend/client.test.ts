import assert from "node:assert/strict";
import test from "node:test";
import { isResendConfigured, resolvePublicAppUrl, sendEmail } from "./client.js";

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
