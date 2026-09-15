import type { CookieOptions, Response } from "express";
import { prisma } from "../../app/prisma.js";
import { env } from "../../app/env.js";
import { ConflictError, UnauthorizedError } from "../../lib/errors.js";
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from "./auth.crypto.js";
import { SESSION_COOKIE, SESSION_TTL_MS } from "./auth.constants.js";
import { normalizeEmail, toUserDto, userPublicSelect } from "./auth.mapper.js";
import type { LoginBody, PatchMeBody, SignupBody, UserDto } from "./auth.schema.js";

function cookieOptions(expires: Date): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
  });
}

export async function signupUser(
  body: SignupBody,
): Promise<{ user: UserDto; token: string; expiresAt: Date }> {
  const email = normalizeEmail(body.email);
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email,
      passwordHash,
      role: "student",
    },
    select: userPublicSelect,
  });

  const session = await createSessionForUser(user.id);
  return { user: toUserDto(user), token: session.token, expiresAt: session.expiresAt };
}

export async function loginUser(
  body: LoginBody,
): Promise<{ user: UserDto; token: string; expiresAt: Date }> {
  const email = normalizeEmail(body.email);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...userPublicSelect, passwordHash: true },
  });

  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  const session = await createSessionForUser(publicUser.id);
  return { user: toUserDto(publicUser), token: session.token, expiresAt: session.expiresAt };
}

export async function logoutSession(token: string | undefined) {
  if (!token) return;
  const tokenHash = hashSessionToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function getUserForSessionToken(token: string | undefined): Promise<UserDto | null> {
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      expiresAt: true,
      user: { select: userPublicSelect },
    },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { tokenHash } });
    return null;
  }

  return toUserDto(session.user);
}

export async function updateMe(userId: string, body: PatchMeBody): Promise<UserDto> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: body.name.trim() },
    select: userPublicSelect,
  });
  return toUserDto(user);
}

async function createSessionForUser(userId: string) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });
  return { token, expiresAt };
}
