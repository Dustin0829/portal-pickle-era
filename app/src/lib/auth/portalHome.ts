/** Post-login home for stub auth — admin → /admin, everyone else → /app. */
export function portalHomePath(role: string | undefined | null) {
  return role === "admin" ? "/admin" : "/app";
}
