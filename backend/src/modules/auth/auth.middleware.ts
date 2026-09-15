import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../lib/errors.js";
import { SESSION_COOKIE } from "./auth.constants.js";
import { getUserForSessionToken } from "./auth.service.js";

export async function loadSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    const user = await getUserForSessionToken(token);
    if (user) {
      req.authUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function requireSession(req: Request, _res: Response, next: NextFunction) {
  if (!req.authUser) {
    next(new UnauthorizedError());
    return;
  }
  next();
}
