import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_API_URL: z
    .string()
    .trim()
    .url("VITE_API_URL must be a valid URL")
    .optional()
    .or(z.literal("")),
});

const clientEnv = clientEnvSchema.parse(import.meta.env);
const rawBase = clientEnv.VITE_API_URL?.replace(/\/$/, "") ?? "";

/** API origin (`VITE_API_URL`). Defaults to local backend. */
export function getApiBaseUrl(): string | undefined {
  return rawBase || "http://localhost:3000";
}
