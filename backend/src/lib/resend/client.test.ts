import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBookingApprovedEmail,
  buildBookingPaymentReceivedEmail,
  buildBookingRejectedEmail,
  buildPasswordChangedEmail,
  buildPasswordResetEmail,
  buildPlayerInviteEmail,
  buildWelcomeEmail,
  isResendConfigured,
  renderBrandedEmail,
  resolveLogoUrl,
  resolvePublicAppUrl,
  sendBookingApprovedEmail,
  sendBookingPaymentReceivedEmail,
  sendBookingRejectedEmail,
  sendEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendPlayerInviteEmail,
  sendWelcomeEmail,
} from "./client.js";

test("isResendConfigured is false when env unset (local default)", () => {
  assert.equal(isResendConfigured(), false);
});

test("resolvePublicAppUrl falls back to first CORS origin when PUBLIC_APP_URL unset", () => {
  const url = resolvePublicAppUrl();
  assert.ok(url.startsWith("http"));
  assert.equal(url.endsWith("/"), false);
});

test("resolveLogoUrl is absolute /logo.png under public app URL", () => {
  const logo = resolveLogoUrl();
  assert.equal(logo, `${resolvePublicAppUrl()}/logo.png`);
});

test("renderBrandedEmail includes logo and yellow CTA", () => {
  const html = renderBrandedEmail({
    bodyHtml: "<p>Hello</p>",
    cta: { href: "https://example.com/login", label: "Log in" },
  });
  assert.match(html, /\/logo\.png/);
  assert.match(html, /#F5C518/);
  assert.match(html, /Log in/);
  assert.match(html, /https:\/\/example\.com\/login/);
});

test("payment-received / invite / reset HTML are branded", () => {
  const payment = buildBookingPaymentReceivedEmail({
    name: "Ada",
    date: "2026-10-05",
    referenceId: "GCASH-1",
  });
  assert.match(payment.html, /\/logo\.png/);
  assert.match(payment.html, /#F5C518/);
  assert.match(payment.html, /View site/);
  assert.match(payment.html, /2026-10-05/);

  const invite = buildPlayerInviteEmail({
    to: "player@example.com",
    tempPassword: "temp-pass-1",
  });
  assert.match(invite.html, /\/logo\.png/);
  assert.match(invite.html, /#F5C518/);
  assert.match(invite.html, /Log in/);
  assert.match(invite.html, /\/login/);
  assert.match(invite.html, /temp-pass-1/);

  const reset = buildPasswordResetEmail({ token: "tok+/=xyz" });
  assert.match(reset.html, /\/logo\.png/);
  assert.match(reset.html, /#F5C518/);
  assert.match(reset.html, /Reset password/);
  assert.match(reset.html, /reset-password\?token=/);
  assert.ok(reset.html.includes(encodeURIComponent("tok+/=xyz")));
});

test("approved / rejected / welcome / password-changed HTML are branded", () => {
  const approved = buildBookingApprovedEmail({
    name: "Ada",
    date: "2026-10-05",
    referenceId: "GCASH-1",
  });
  assert.match(approved.subject, /approved/i);
  assert.match(approved.html, /\/logo\.png/);
  assert.match(approved.html, /Open portal/);
  assert.match(approved.html, /2026-10-05/);
  assert.doesNotMatch(approved.html, /Temporary password/i);

  const rejected = buildBookingRejectedEmail({
    name: "Ada",
    date: "2026-10-05",
  });
  assert.match(rejected.html, /\/logo\.png/);
  assert.match(rejected.html, /View site/);
  assert.match(rejected.html, /couldn’t approve|could not approve/i);

  const welcome = buildWelcomeEmail({ name: "Ada" });
  assert.match(welcome.subject, /Welcome/i);
  assert.match(welcome.html, /your new era starts here/i);
  assert.match(welcome.html, /Log in/);
  assert.doesNotMatch(welcome.html, /Temporary password/i);

  const changed = buildPasswordChangedEmail({
    name: "Ada",
    changedAtUtc: "2026-09-22T01:00:00Z",
  });
  assert.match(changed.html, /password was changed/i);
  assert.match(changed.html, /2026-09-22T01:00:00Z/);
  assert.match(changed.html, /forgot-password/);
  assert.match(changed.html, /wasn’t you|was not you/i);
});

test("new status/welcome/password senders skip without throwing when Resend env unset", async () => {
  for (const result of await Promise.all([
    sendBookingApprovedEmail({
      to: "player@example.com",
      name: "Ada",
      date: "2026-10-05",
    }),
    sendBookingRejectedEmail({
      to: "player@example.com",
      name: "Ada",
      date: "2026-10-05",
    }),
    sendWelcomeEmail({ to: "player@example.com", name: "Ada" }),
    sendPasswordChangedEmail({
      to: "player@example.com",
      name: "Ada",
      changedAtUtc: "2026-09-22T01:00:00Z",
    }),
  ])) {
    assert.equal(result.sent, false);
    if (!result.sent) {
      assert.equal(result.reason, "not_configured");
    }
  }
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
