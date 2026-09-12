import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_API_URL: z
    .string()
    .trim()
    .url("VITE_API_URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  VITE_ADMIN_BASIC_AUTH_USER: z.string().optional(),
  VITE_ADMIN_BASIC_AUTH_PASSWORD: z.string().optional(),
});

const clientEnv = clientEnvSchema.parse(import.meta.env);
const rawBase = clientEnv.VITE_API_URL?.replace(/\/$/, "") ?? "";

export function getApiBaseUrl(): string | undefined {
  return rawBase || "http://localhost:3000";
}

export function getAdminBasicAuthHeader(): string | undefined {
  const user = clientEnv.VITE_ADMIN_BASIC_AUTH_USER;
  const password = clientEnv.VITE_ADMIN_BASIC_AUTH_PASSWORD;
  if (!user || !password) return undefined;
  return `Basic ${btoa(`${user}:${password}`)}`;
}
