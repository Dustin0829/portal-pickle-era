import { env } from "../../app/env.js";
import { logger } from "../../app/logger.js";

type DiscordField = {
  name: string;
  value: string;
  inline?: boolean;
};

type DiscordAlert = {
  title: string;
  description?: string | undefined;
  color?: number;
  fields?: DiscordField[];
};

const throttleWindowMs = 2 * 60 * 1000;
const sentAtByKey = new Map<string, number>();

export async function sendDiscordAlert(alert: DiscordAlert, throttleKey: string): Promise<void> {
  if (!env.DISCORD_API_ALERT_WEBHOOK_URL) return;

  const now = Date.now();
  const lastSentAt = sentAtByKey.get(throttleKey);
  if (lastSentAt && now - lastSentAt < throttleWindowMs) return;
  sentAtByKey.set(throttleKey, now);

  try {
    const response = await fetch(env.DISCORD_API_ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: alert.title,
            description: alert.description,
            color: alert.color ?? 0xff9500,
            fields: alert.fields,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      logger.warn("discord_alert_failed", {
        status: response.status,
        statusText: response.statusText,
      });
    }
  } catch (error) {
    logger.warn("discord_alert_error", { error });
  }
}
