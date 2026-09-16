import type { CookieOptions, Response } from "express";
import { LEGACY_SESSION_COOKIE } from "./auth.constants.js";
import { env } from "../../app/env.js";

function legacyClearOptions(): CookieOptions {
  const base: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
  };
  if (env.AUTH_COOKIE_DOMAIN) {
    return { ...base, domain: env.AUTH_COOKIE_DOMAIN };
  }
  return base;
}

/** Clear leftover custom pe_session cookies after Better Auth cutover. */
export function clearLegacySessionCookie(res: Response) {
  res.clearCookie(LEGACY_SESSION_COOKIE, legacyClearOptions());
  if (env.AUTH_COOKIE_DOMAIN) {
    res.clearCookie(LEGACY_SESSION_COOKIE, {
      ...legacyClearOptions(),
      domain: undefined,
    });
  }
}

export function appendSetCookieHeaders(res: Response, headers: Headers) {
  const getSetCookie = headers.getSetCookie?.bind(headers);
  if (getSetCookie) {
    for (const cookie of getSetCookie()) {
      res.append("Set-Cookie", cookie);
    }
    return;
  }
  const single = headers.get("set-cookie");
  if (single) {
    res.append("Set-Cookie", single);
  }
}
