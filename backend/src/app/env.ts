import "dotenv/config";
import { z } from "zod";

const optionalNumber = (fallback: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === "") return fallback;
    return Number(value);
  }, z.number().int().positive());

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: optionalNumber(3000),
    DATABASE_URL: z
      .string()
      .url()
      .default("postgresql://postgres:postgres@localhost:5432/backend?schema=public"),
    REDIS_URL: z.string().url().optional(),
    LOGS_DATABASE_URL: z.string().url().optional(),
    API_CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:5174"),
    RATE_LIMIT_WINDOW_MS: optionalNumber(60_000),
    RATE_LIMIT_MAX: optionalNumber(300),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_PUBLIC_BASE_URL: z.string().url().optional(),
    LOG_LEVEL: z.string().default("info"),
    OBSERVABILITY_SERVICE: z.string().default("backend"),
    DISCORD_API_ALERT_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
    DISCORD_ALERT_SLOW_MS: optionalNumber(5000),
    ADMIN_BASIC_AUTH_USER: z.string().min(1).optional(),
    ADMIN_BASIC_AUTH_PASSWORD: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    const hasUser = Boolean(data.ADMIN_BASIC_AUTH_USER);
    const hasPassword = Boolean(data.ADMIN_BASIC_AUTH_PASSWORD);

    if (hasUser !== hasPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ADMIN_BASIC_AUTH_USER and ADMIN_BASIC_AUTH_PASSWORD must both be set",
      });
    }
  });

export const env = envSchema.parse(process.env);

export type AppEnv = typeof env;

export function parseCorsOrigins(raw: string): string[] {
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
