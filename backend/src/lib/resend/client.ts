import { Resend } from "resend";
import { env, parseCorsOrigins } from "../../app/env.js";
import { logger } from "../../app/logger.js";

export type SendEmailResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: "not_configured" | "provider_error" | "error"; message: string };

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

/** Ack after marketing booking + payment proof submit (pending review). */
export async function sendBookingPaymentReceivedEmail(input: {
  to: string;
  name: string;
  date: string;
  referenceId?: string;
}): Promise<SendEmailResult> {
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

  const html = `
    <p>Hi ${escapeHtml(displayName)},</p>
    <p>We received your booking payment proof. Our team will review it shortly.</p>
    <ul>
      <li><strong>Date:</strong> ${escapeHtml(input.date)}</li>
      ${
        refLine
          ? `<li><strong>Reference:</strong> ${escapeHtml(input.referenceId!.trim())}</li>`
          : ""
      }
    </ul>
    <p>You’ll get another email once your booking is approved (with portal login details if this is your first visit).</p>
    <p>— Pickle Era</p>
  `.trim();

  return sendEmail({ to: input.to, subject, html, text });
}

export async function sendPlayerInviteEmail(input: {
  to: string;
  tempPassword: string;
}): Promise<SendEmailResult> {
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

  const html = `
    <p>Your booking was approved. You can sign in to the player portal with these credentials:</p>
    <ul>
      <li><strong>Portal:</strong> <a href="${loginUrl}">${loginUrl}</a></li>
      <li><strong>Email:</strong> ${escapeHtml(input.to)}</li>
      <li><strong>Temporary password:</strong> ${escapeHtml(input.tempPassword)}</li>
    </ul>
    <p>Please change your password after you log in.</p>
    <p>If you lose this password, <a href="${forgotUrl}">reset it here</a>.</p>
  `.trim();

  return sendEmail({ to: input.to, subject, html, text });
}

/** Password reset link for forgot-password (SPA URL with token). */
export async function sendPasswordResetEmail(input: {
  to: string;
  token: string;
}): Promise<SendEmailResult> {
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

  const html = `
    <p>We received a request to reset your Pickle Era password.</p>
    <p><a href="${resetUrl}">Choose a new password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
    <p>— Pickle Era</p>
  `.trim();

  return sendEmail({ to: input.to, subject, html, text });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
