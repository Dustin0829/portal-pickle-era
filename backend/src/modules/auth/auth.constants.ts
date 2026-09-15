export const SESSION_COOKIE = "pe_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
};
