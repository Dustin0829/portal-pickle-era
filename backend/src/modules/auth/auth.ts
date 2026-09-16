import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  env,
  parseCorsOrigins,
  resolveBetterAuthSecret,
  resolveBetterAuthUrl,
} from "../../app/env.js";
import { prisma } from "../../app/prisma.js";

const cookieDomain = env.AUTH_COOKIE_DOMAIN?.trim() || undefined;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: resolveBetterAuthSecret(),
  baseURL: resolveBetterAuthUrl(),
  basePath: "/auth",
  trustedOrigins: parseCorsOrigins(env.API_CORS_ORIGIN),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: false,
      },
    },
  },
  advanced: {
    ...(cookieDomain
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: cookieDomain,
          },
          useSecureCookies: env.NODE_ENV === "production",
        }
      : {
          useSecureCookies: env.NODE_ENV === "production",
        }),
  },
});

export type AuthInstance = typeof auth;
