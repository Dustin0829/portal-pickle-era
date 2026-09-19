import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../../app/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

export type StudentUserRef = {
  id: string;
  email: string;
  name: string;
};

export type EnsureStudentResult = {
  user: StudentUserRef;
  /** Present only when a new user was created in this call — never put in API DTOs. */
  tempPassword: string | null;
  createdNewUser: boolean;
};

type DbClient = Prisma.TransactionClient | typeof prisma;

/** Crypto-random temporary password (URL-safe, no ambiguous padding). */
export function generateTempPassword(bytes = 18): string {
  return randomBytes(bytes).toString("base64url");
}

/**
 * Find or create a student User + credential Account (seed pattern).
 * Existing users are reused without regenerating passwords.
 */
export async function ensureStudentCredentialUser(
  input: { name: string; email: string },
  db: DbClient = prisma,
): Promise<EnsureStudentResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email;

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (existing) {
    return {
      user: { id: existing.id, email: existing.email, name: existing.name },
      tempPassword: null,
      createdNewUser: false,
    };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const userId = randomUUID();
  const accountId = randomUUID();

  await db.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: true,
      role: "student",
      accounts: {
        create: {
          id: accountId,
          accountId: userId,
          providerId: "credential",
          password: passwordHash,
        },
      },
    },
  });

  return {
    user: { id: userId, email, name },
    tempPassword,
    createdNewUser: true,
  };
}

/**
 * Decide whether to attempt a credentials invite for this approve.
 * Pure helper for tests — keep in sync with `patchBookingStatus` orchestration.
 */
export function planInviteCredentialsEmail(input: {
  createdNewUser: boolean;
  resendConfigured: boolean;
}): "send" | "skip_existing_user" | "skip_not_configured" {
  if (!input.createdNewUser) return "skip_existing_user";
  if (!input.resendConfigured) return "skip_not_configured";
  return "send";
}
