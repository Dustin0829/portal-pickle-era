import type { Request } from "express";
import { APIError } from "better-auth";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../../app/prisma.js";
import { ConflictError, UnauthorizedError } from "../../lib/errors.js";
import { auth } from "./auth.js";
import { isUserRole, type AuthUser } from "./auth.constants.js";
import { normalizeEmail, toUserDto, userPublicSelect } from "./auth.mapper.js";
import type { LoginBody, PatchMeBody, SignupBody, UserDto } from "./auth.schema.js";

type AuthHeaderResult<T> = {
  headers: Headers;
  response: T;
};

function mapAuthError(error: unknown): never {
  if (error instanceof APIError) {
    const status = typeof error.statusCode === "number" ? error.statusCode : Number(error.status);
    const message = error.message || "Authentication failed";
    if (status === 401) {
      throw new UnauthorizedError(
        message.includes("Invalid") ? "Invalid email or password" : message,
      );
    }
    if (status === 409 || /already|exist/i.test(message)) {
      throw new ConflictError("An account with this email already exists");
    }
    if (status === 422 || status === 400) {
      throw new UnauthorizedError(message);
    }
  }
  throw error;
}

async function callWithHeaders<T>(
  run: () => Promise<AuthHeaderResult<T> | T>,
): Promise<AuthHeaderResult<T>> {
  try {
    const result = await run();
    if (result && typeof result === "object" && "headers" in result && "response" in result) {
      return result;
    }
    return { headers: new Headers(), response: result };
  } catch (error) {
    mapAuthError(error);
  }
}

function roleFromUser(user: { role?: unknown }): AuthUser["role"] {
  return isUserRole(user.role) ? user.role : "student";
}

export function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  role?: unknown;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleFromUser(user),
  };
}

export async function signupWithBetterAuth(
  body: SignupBody,
  req: Request,
): Promise<{ user: UserDto; headers: Headers }> {
  const email = normalizeEmail(body.email);
  const { headers, response } = await callWithHeaders(() =>
    auth.api.signUpEmail({
      body: {
        name: body.name.trim(),
        email,
        password: body.password,
      },
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    }),
  );

  const userRow = await prisma.user.findUniqueOrThrow({
    where: { id: response.user.id },
    select: userPublicSelect,
  });

  return { user: toUserDto(userRow), headers };
}

export async function loginWithBetterAuth(
  body: LoginBody,
  req: Request,
): Promise<{ user: UserDto; headers: Headers }> {
  const email = normalizeEmail(body.email);
  const { headers, response } = await callWithHeaders(() =>
    auth.api.signInEmail({
      body: {
        email,
        password: body.password,
      },
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    }),
  );

  const userRow = await prisma.user.findUniqueOrThrow({
    where: { id: response.user.id },
    select: userPublicSelect,
  });

  return { user: toUserDto(userRow), headers };
}

export async function logoutWithBetterAuth(req: Request): Promise<Headers> {
  try {
    const { headers } = await callWithHeaders(() =>
      auth.api.signOut({
        headers: fromNodeHeaders(req.headers),
        returnHeaders: true,
      }),
    );
    return headers;
  } catch {
    // Idempotent logout when no session is present
    return new Headers();
  }
}

export async function getSessionUser(req: Request): Promise<AuthUser | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user) return null;
  return toAuthUser(session.user);
}

export async function updateMe(userId: string, body: PatchMeBody): Promise<UserDto> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: body.name.trim() },
    select: userPublicSelect,
  });
  return toUserDto(user);
}

export async function getUserDtoById(userId: string): Promise<UserDto> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: userPublicSelect,
  });
  return toUserDto(user);
}
