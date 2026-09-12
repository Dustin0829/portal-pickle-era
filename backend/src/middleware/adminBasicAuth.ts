import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { env, type AppEnv } from "../app/env.js";

export function resolveAdminToolsAccess(input: {
  nodeEnv: AppEnv["NODE_ENV"];
  user?: string;
  password?: string;
}) {
  const configured = Boolean(input.user && input.password);

  return {
    configured,
    mounted: input.nodeEnv !== "production" || configured,
    protected: configured,
  };
}

function adminToolsEnvInput(): {
  nodeEnv: AppEnv["NODE_ENV"];
  user?: string;
  password?: string;
} {
  return {
    nodeEnv: env.NODE_ENV,
    ...(env.ADMIN_BASIC_AUTH_USER ? { user: env.ADMIN_BASIC_AUTH_USER } : {}),
    ...(env.ADMIN_BASIC_AUTH_PASSWORD ? { password: env.ADMIN_BASIC_AUTH_PASSWORD } : {}),
  };
}

export function isAdminBasicAuthConfigured(): boolean {
  return resolveAdminToolsAccess(adminToolsEnvInput()).configured;
}

export function shouldMountAdminTools(): boolean {
  return resolveAdminToolsAccess(adminToolsEnvInput()).mounted;
}

export function shouldProtectAdminTools(): boolean {
  return resolveAdminToolsAccess(adminToolsEnvInput()).protected;
}

function readBasicAuthCredentials(
  authorizationHeader: string | undefined,
): { username: string; password: string } | undefined {
  if (!authorizationHeader?.startsWith("Basic ")) return undefined;

  const encoded = authorizationHeader.slice("Basic ".length);
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const separatorIndex = decoded.indexOf(":");

  if (separatorIndex === -1) {
    return { username: decoded, password: "" };
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  };
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function sendUnauthorized(res: Parameters<RequestHandler>[1]): void {
  res.setHeader("WWW-Authenticate", 'Basic realm="Admin tools"');
  res.status(401).send("Authentication required");
}

export const protectAdminTools: RequestHandler = (req, res, next) => {
  if (!shouldProtectAdminTools()) {
    next();
    return;
  }

  const credentials = readBasicAuthCredentials(req.headers.authorization);
  const expectedUser = env.ADMIN_BASIC_AUTH_USER;
  const expectedPassword = env.ADMIN_BASIC_AUTH_PASSWORD;

  if (
    credentials &&
    expectedUser &&
    expectedPassword &&
    safeEqual(credentials.username, expectedUser) &&
    safeEqual(credentials.password, expectedPassword)
  ) {
    next();
    return;
  }

  sendUnauthorized(res);
};
