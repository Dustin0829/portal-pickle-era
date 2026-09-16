import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import { UnauthorizedError } from "../../lib/errors.js";
import { prisma } from "../../app/prisma.js";
import { SESSION_COOKIE } from "./auth.constants.js";
import { toUserDto, userPublicSelect } from "./auth.mapper.js";
import type { LoginBody, PatchMeBody, SignupBody } from "./auth.schema.js";
import {
  clearSessionCookie,
  loginUser,
  logoutSession,
  setSessionCookie,
  signupUser,
  updateMe,
} from "./auth.service.js";

export async function signupController(req: Request, res: Response) {
  const result = await signupUser(req.body as SignupBody);
  setSessionCookie(res, result.token, result.expiresAt);
  return sendSuccess(res, result.user, "ok", 201);
}

export async function loginController(req: Request, res: Response) {
  const result = await loginUser(req.body as LoginBody);
  setSessionCookie(res, result.token, result.expiresAt);
  return sendSuccess(res, result.user, "ok", 200);
}

export async function logoutController(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  await logoutSession(token);
  clearSessionCookie(res);
  return sendSuccess(res, { ok: true }, "ok", 200);
}

export async function meController(req: Request, res: Response) {
  if (!req.authUser) {
    throw new UnauthorizedError();
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.authUser.id },
    select: userPublicSelect,
  });
  return sendSuccess(res, toUserDto(user), "ok", 200);
}

export async function patchMeController(req: Request, res: Response) {
  if (!req.authUser) {
    throw new UnauthorizedError();
  }
  const user = await updateMe(req.authUser.id, req.body as PatchMeBody);
  return sendSuccess(res, user, "ok", 200);
}
