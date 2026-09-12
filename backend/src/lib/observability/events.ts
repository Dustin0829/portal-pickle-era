import { logger } from "../../app/logger.js";
import { sendDiscordAlert } from "./discord-alert.js";
import { formatHttpAlertError } from "./format-http-alert-error.js";

export async function emitUnhandledError(error: unknown, context: Record<string, unknown> = {}) {
  logger.error("unhandled_error", {
    error:
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
    ...context,
  });

  await sendDiscordAlert(
    {
      title: "Unhandled backend error",
      description: formatHttpAlertError(error)?.slice(0, 1500),
      fields: Object.entries(context).map(([name, value]) => ({
        name,
        value: String(value),
      })),
      color: 0xff3b30,
    },
    "unhandled_error",
  );
}
