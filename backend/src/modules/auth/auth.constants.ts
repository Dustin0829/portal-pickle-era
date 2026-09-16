export const LEGACY_SESSION_COOKIE = "pe_session";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
};

export function isUserRole(value: unknown): value is AuthUser["role"] {
  return value === "student" || value === "admin";
}
