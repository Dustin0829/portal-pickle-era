import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../lib/errors.js";
import { getSessionUser } from "./auth.service.js";

export async function loadSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await getSessionUser(req);
    if (user) {
      req.authUser = user;
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
