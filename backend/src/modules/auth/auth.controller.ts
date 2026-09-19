import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import { UnauthorizedError } from "../../lib/errors.js";
import { appendSetCookieHeaders, clearLegacySessionCookie } from "./auth.cookies.js";
import type {
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  PatchMeBody,
  ResetPasswordBody,
  SignupBody,
} from "./auth.schema.js";
import {
  changePasswordWithBetterAuth,
  getUserDtoById,
  loginWithBetterAuth,
  logoutWithBetterAuth,
  requestPasswordResetWithBetterAuth,
  resetPasswordWithBetterAuth,
  signupWithBetterAuth,
  updateMe,
} from "./auth.service.js";

function finishAuth(res: Response, headers: Headers) {
  appendSetCookieHeaders(res, headers);
  clearLegacySessionCookie(res);
}

export async function signupController(req: Request, res: Response) {
  const result = await signupWithBetterAuth(req.body as SignupBody, req);
  finishAuth(res, result.headers);
  return sendSuccess(res, result.user, "ok", 201);
}

export async function loginController(req: Request, res: Response) {
  const result = await loginWithBetterAuth(req.body as LoginBody, req);
  finishAuth(res, result.headers);
  return sendSuccess(res, result.user, "ok", 200);
}

export async function logoutController(req: Request, res: Response) {
  const headers = await logoutWithBetterAuth(req);
  finishAuth(res, headers);
  return sendSuccess(res, { ok: true }, "ok", 200);
}

export async function meController(req: Request, res: Response) {
  if (!req.authUser) {
    throw new UnauthorizedError();
  }
  const user = await getUserDtoById(req.authUser.id);
  return sendSuccess(res, user, "ok", 200);
}

export async function patchMeController(req: Request, res: Response) {
  if (!req.authUser) {
    throw new UnauthorizedError();
  }
  const user = await updateMe(req.authUser.id, req.body as PatchMeBody);
  return sendSuccess(res, user, "ok", 200);
}

export async function changePasswordController(req: Request, res: Response) {
  if (!req.authUser) {
    throw new UnauthorizedError();
  }
  const result = await changePasswordWithBetterAuth(req.body as ChangePasswordBody, req);
  return sendSuccess(res, result, "ok", 200);
}

export async function forgotPasswordController(req: Request, res: Response) {
  const result = await requestPasswordResetWithBetterAuth(req.body as ForgotPasswordBody, req);
  return sendSuccess(res, result, "ok", 200);
}

export async function resetPasswordController(req: Request, res: Response) {
  const result = await resetPasswordWithBetterAuth(req.body as ResetPasswordBody, req);
  return sendSuccess(res, result, "ok", 200);
}
