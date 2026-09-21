import { Resend } from "resend";
import { env, parseCorsOrigins } from "../../app/env.js";
import { logger } from "../../app/logger.js";

export type SendEmailResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: "not_configured" | "provider_error" | "error"; message: string };

const BRAND_YELLOW = "#F5C518";

export function isResendConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

/** SPA origin for invite login links. */
export function resolvePublicAppUrl(): string {
  if (env.PUBLIC_APP_URL) {
    return env.PUBLIC_APP_URL.replace(/\/$/, "");
  }
  const firstCors = parseCorsOrigins(env.API_CORS_ORIGIN)[0];
  if (firstCors) {
    return firstCors.replace(/\/$/, "");
  }
  return "http://localhost:5173";
}

/** Absolute logo URL served from the SPA public folder (`app/public/logo.png`). */
export function resolveLogoUrl(): string {
  return `${resolvePublicAppUrl()}/logo.png`;
}

/**
 * Shared Pickle Era HTML shell: logo, body, yellow CTA, footer.
 * `bodyHtml` must already be escaped by the caller.
 */
export function renderBrandedEmail(input: {
  bodyHtml: string;
  cta: { href: string; label: string };
}): string {
  const logoUrl = resolveLogoUrl();
  const href = escapeHtml(input.cta.href);
  const label = escapeHtml(input.cta.label);
  return `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#111111;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#1a1a1a;border-radius:8px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:28px 24px 16px;background:#000000;">
              <img src="${escapeHtml(logoUrl)}" alt="Pickle Era" width="160" style="display:block;max-width:160px;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;color:#f5f5f5;font-size:15px;line-height:1.55;">
              ${input.bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 28px 28px;">
              <a href="${href}" style="display:inline-block;background:${BRAND_YELLOW};color:#000000;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;padding:14px 28px;border-radius:4px;">${label}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;color:#888888;font-size:12px;line-height:1.4;text-align:center;">
              — Pickle Era
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send a transactional email via Resend.
 * Never throws for API/provider errors — callers check `{ sent }`.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendEmailResult> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.info("resend_skipped", {
      provider: "resend",
      operation: "send",
      reason: "not_configured",
    });
    return {
      sent: false,
      reason: "not_configured",
      message: "Invite email skipped: RESEND_API_KEY or EMAIL_FROM is not configured",
    };
  }

  const started = Date.now();
  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
    });

    if (error) {
      logger.warn("resend_send_failed", {
        provider: "resend",
        operation: "send",
        durationMs: Date.now() - started,
        message: error.message,
      });
      return {
        sent: false,
        reason: "provider_error",
        message: `Invite email failed: ${error.message}`,
      };
    }

    logger.info("resend_send_ok", {
      provider: "resend",
      operation: "send",
      durationMs: Date.now() - started,
      id: data?.id ?? null,
    });
    return { sent: true, id: data?.id ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    logger.warn("resend_send_error", {
      provider: "resend",
      operation: "send",
      durationMs: Date.now() - started,
      error: message,
    });
    return {
      sent: false,
      reason: "error",
      message: `Invite email failed: ${message}`,
    };
  }
}

/** Pure HTML/text builders — tested without Resend. */
export function buildBookingPaymentReceivedEmail(input: {
  name: string;
  date: string;
  referenceId?: string;
}): { subject: string; html: string; text: string } {
  const displayName = input.name.trim() || "there";
  const refLine = input.referenceId?.trim() ? `Reference: ${input.referenceId.trim()}` : null;
  const subject = "Payment received — we’ll review your booking";
  const text = [
    `Hi ${displayName},`,
    "",
    "We received your booking payment proof. Our team will review it shortly.",
    "",
    `Date: ${input.date}`,
    ...(refLine ? [refLine] : []),
    "",
    "You’ll get another email once your booking is approved (with portal login details if this is your first visit).",
    "",
    "— Pickle Era",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 12px;">Hi ${escapeHtml(displayName)},</p>
    <p style="margin:0 0 12px;">We received your booking payment proof. Our team will review it shortly.</p>
    <ul style="margin:0 0 12px;padding-left:20px;">
      <li><strong>Date:</strong> ${escapeHtml(input.date)}</li>
      ${
        refLine
          ? `<li><strong>Reference:</strong> ${escapeHtml(input.referenceId!.trim())}</li>`
          : ""
      }
    </ul>
    <p style="margin:0;">You’ll get another email once your booking is approved (with portal login details if this is your first visit).</p>
  `.trim();

  return {
    subject,
    text,
    html: renderBrandedEmail({
      bodyHtml,
      cta: { href: resolvePublicAppUrl(), label: "View site" },
    }),
  };
}

export function buildPlayerInviteEmail(input: { to: string; tempPassword: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const portalUrl = resolvePublicAppUrl();
  const loginUrl = `${portalUrl}/login`;
  const forgotUrl = `${portalUrl}/forgot-password`;
  const subject = "Your Pickle Era portal login";
  const text = [
    "Your booking was approved. You can sign in to the player portal with these credentials:",
    "",
    `Portal: ${loginUrl}`,
    `Email: ${input.to}`,
    `Temporary password: ${input.tempPassword}`,
    "",
    "Please change your password after you log in.",
    `If you lose this password, reset it here: ${forgotUrl}`,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 12px;">Your booking was approved. You can sign in to the player portal with these credentials:</p>
    <ul style="margin:0 0 12px;padding-left:20px;">
      <li><strong>Portal:</strong> <a href="${escapeHtml(loginUrl)}" style="color:${BRAND_YELLOW};">${escapeHtml(loginUrl)}</a></li>
      <li><strong>Email:</strong> ${escapeHtml(input.to)}</li>
      <li><strong>Temporary password:</strong> ${escapeHtml(input.tempPassword)}</li>
    </ul>
    <p style="margin:0 0 12px;">Please change your password after you log in.</p>
    <p style="margin:0;">If you lose this password, <a href="${escapeHtml(forgotUrl)}" style="color:${BRAND_YELLOW};">reset it here</a>.</p>
  `.trim();

  return {
    subject,
    text,
    html: renderBrandedEmail({
      bodyHtml,
      cta: { href: loginUrl, label: "Log in" },
    }),
  };
}

export function buildBookingApprovedEmail(input: {
  name: string;
  date: string;
  referenceId?: string;
}): { subject: string; html: string; text: string } {
  const displayName = input.name.trim() || "there";
  const refLine = input.referenceId?.trim() ? `Reference: ${input.referenceId.trim()}` : null;
  const portalUrl = resolvePublicAppUrl();
  const subject = "Your booking is approved — Pickle Era";
  const text = [
    `Hi ${displayName},`,
    "",
    "Your booking has been approved. You’re all set.",
    "",
    `Date: ${input.date}`,
    ...(refLine ? [refLine] : []),
    "",
    `Portal: ${portalUrl}`,
    "",
    "— Pickle Era",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 12px;">Hi ${escapeHtml(displayName)},</p>
    <p style="margin:0 0 12px;">Your booking has been approved. You’re all set.</p>
    <ul style="margin:0 0 12px;padding-left:20px;">
      <li><strong>Date:</strong> ${escapeHtml(input.date)}</li>
      ${
        refLine
          ? `<li><strong>Reference:</strong> ${escapeHtml(input.referenceId!.trim())}</li>`
          : ""
      }
    </ul>
  `.trim();

  return {
    subject,
    text,
    html: renderBrandedEmail({
      bodyHtml,
      cta: { href: portalUrl, label: "Open portal" },
    }),
  };
}

export function buildBookingRejectedEmail(input: {
  name: string;
  date: string;
  referenceId?: string;
}): { subject: string; html: string; text: string } {
  const displayName = input.name.trim() || "there";
  const refLine = input.referenceId?.trim() ? `Reference: ${input.referenceId.trim()}` : null;
  const portalUrl = resolvePublicAppUrl();
  const subject = "Booking update — Pickle Era";
  const text = [
    `Hi ${displayName},`,
    "",
    "Unfortunately we couldn’t approve your booking this time.",
    "",
    `Date: ${input.date}`,
    ...(refLine ? [refLine] : []),
    "",
    "You can book another session anytime on our site.",
    "",
    "— Pickle Era",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 12px;">Hi ${escapeHtml(displayName)},</p>
    <p style="margin:0 0 12px;">Unfortunately we couldn’t approve your booking this time.</p>
    <ul style="margin:0 0 12px;padding-left:20px;">
      <li><strong>Date:</strong> ${escapeHtml(input.date)}</li>
      ${
        refLine
          ? `<li><strong>Reference:</strong> ${escapeHtml(input.referenceId!.trim())}</li>`
          : ""
      }
    </ul>
    <p style="margin:0;">You can book another session anytime on our site.</p>
  `.trim();

  return {
    subject,
    text,
    html: renderBrandedEmail({
      bodyHtml,
      cta: { href: portalUrl, label: "View site" },
    }),
  };
}

export function buildWelcomeEmail(input: { name: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const displayName = input.name.trim() || "there";
  const portalUrl = resolvePublicAppUrl();
  const loginUrl = `${portalUrl}/login`;
  const subject = "Welcome to Pickle Era";
  const text = [
    `Hi ${displayName},`,
    "",
    "Welcome to Pickle Era — your new era starts here.",
    "",
    `Sign in anytime: ${loginUrl}`,
    "",
    "— Pickle Era",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 12px;">Hi ${escapeHtml(displayName)},</p>
    <p style="margin:0;">Welcome to Pickle Era — your new era starts here.</p>
  `.trim();

  return {
    subject,
    text,
    html: renderBrandedEmail({
      bodyHtml,
      cta: { href: loginUrl, label: "Log in" },
    }),
  };
}

export function buildPasswordChangedEmail(input: { name: string; changedAtUtc: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const displayName = input.name.trim() || "there";
  const portalUrl = resolvePublicAppUrl();
  const forgotUrl = `${portalUrl}/forgot-password`;
  const subject = "Your Pickle Era password was changed";
  const text = [
    `Hi ${displayName},`,
    "",
    "Your Pickle Era password was changed.",
    "",
    `When (UTC): ${input.changedAtUtc}`,
    "",
    `If this wasn’t you, reset your password here: ${forgotUrl}`,
    "",
    "— Pickle Era",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 12px;">Hi ${escapeHtml(displayName)},</p>
    <p style="margin:0 0 12px;">Your Pickle Era password was changed.</p>
    <p style="margin:0 0 12px;"><strong>When (UTC):</strong> ${escapeHtml(input.changedAtUtc)}</p>
    <p style="margin:0;">If this wasn’t you, <a href="${escapeHtml(forgotUrl)}" style="color:${BRAND_YELLOW};">reset your password here</a>.</p>
  `.trim();

  return {
    subject,
    text,
    html: renderBrandedEmail({
      bodyHtml,
      cta: { href: forgotUrl, label: "Forgot password" },
    }),
  };
}

export function buildPasswordResetEmail(input: { token: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const portalUrl = resolvePublicAppUrl();
  const resetUrl = `${portalUrl}/reset-password?token=${encodeURIComponent(input.token)}`;
  const subject = "Reset your Pickle Era password";
  const text = [
    "We received a request to reset your Pickle Era password.",
    "",
    `Open this link to choose a new password: ${resetUrl}`,
    "",
    "If you did not request this, you can ignore this email.",
    "",
    "— Pickle Era",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 12px;">We received a request to reset your Pickle Era password.</p>
    <p style="margin:0;">If you did not request this, you can ignore this email.</p>
  `.trim();

  return {
    subject,
    text,
    html: renderBrandedEmail({
      bodyHtml,
      cta: { href: resetUrl, label: "Reset password" },
    }),
  };
}

/** Ack after marketing booking + payment proof submit (pending review). */
export async function sendBookingPaymentReceivedEmail(input: {
  to: string;
  name: string;
  date: string;
  referenceId?: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = buildBookingPaymentReceivedEmail(input);
  return sendEmail({ to: input.to, subject, html, text });
}

export async function sendPlayerInviteEmail(input: {
  to: string;
  tempPassword: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = buildPlayerInviteEmail(input);
  return sendEmail({ to: input.to, subject, html, text });
}

/** Password reset link for forgot-password (SPA URL with token). */
export async function sendPasswordResetEmail(input: {
  to: string;
  token: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = buildPasswordResetEmail(input);
  return sendEmail({ to: input.to, subject, html, text });
}

export async function sendBookingApprovedEmail(input: {
  to: string;
  name: string;
  date: string;
  referenceId?: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = buildBookingApprovedEmail(input);
  return sendEmail({ to: input.to, subject, html, text });
}

export async function sendBookingRejectedEmail(input: {
  to: string;
  name: string;
  date: string;
  referenceId?: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = buildBookingRejectedEmail(input);
  return sendEmail({ to: input.to, subject, html, text });
}

export async function sendWelcomeEmail(input: {
  to: string;
  name: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = buildWelcomeEmail(input);
  return sendEmail({ to: input.to, subject, html, text });
}

export async function sendPasswordChangedEmail(input: {
  to: string;
  name: string;
  changedAtUtc: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = buildPasswordChangedEmail(input);
  return sendEmail({ to: input.to, subject, html, text });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
