import type { Request, Response } from "express";
import { env } from "../../app/env.js";
import { sendDiscordAlert } from "./discord-alert.js";
import { formatHttpAlertError } from "./format-http-alert-error.js";
import { getHttpAlertKind, isAlertExcludedPath } from "./http-discord-alert-rules.js";
import { isSensitiveAlertBodyPath, redactAlertPayload } from "./alert-payload-redact.js";

function jsonField(value: unknown): string {
  return `\`\`\`json\n${JSON.stringify(value, null, 2).slice(0, 900)}\n\`\`\``;
}

export async function maybeAlertHttpResponse(
  req: Request,
  res: Response,
  durationMs: number,
): Promise<void> {
  if (isAlertExcludedPath(req.path)) return;

  const kind = getHttpAlertKind(res.statusCode, durationMs);
  if (!kind) return;

  const fields = [
    { name: "Method", value: req.method, inline: true },
    { name: "Path", value: req.originalUrl, inline: true },
    { name: "Status", value: String(res.statusCode), inline: true },
    { name: "Duration", value: `${durationMs}ms`, inline: true },
    { name: "Request ID", value: res.locals.requestId ?? "unknown", inline: false },
  ];

  if (!isSensitiveAlertBodyPath(req.path)) {
    fields.push({
      name: "Request body",
      value: jsonField(redactAlertPayload(req.body)),
      inline: false,
    });

    if (res.locals.httpAlertResponseBody) {
      fields.push({
        name: "Response body",
        value: jsonField(redactAlertPayload(res.locals.httpAlertResponseBody)),
        inline: false,
      });
    }
  }

  const error = formatHttpAlertError(res.locals.httpAlertError);
  if (error) {
    fields.push({ name: "Error", value: error.slice(0, 900), inline: false });
  }

  await sendDiscordAlert(
    {
      title: `${env.OBSERVABILITY_SERVICE}: ${kind} HTTP response`,
      color: kind === "5xx" ? 0xff3b30 : kind === "slow" ? 0xffcc00 : 0xff9500,
      fields,
    },
    `${req.method}:${req.path}:${kind}`,
  );
}
