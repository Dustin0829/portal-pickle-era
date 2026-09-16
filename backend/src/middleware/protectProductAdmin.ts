import type { RequestHandler } from "express";
import { loadSession } from "../modules/auth/auth.middleware.js";
import { protectAdminTools, shouldProtectAdminTools } from "./adminBasicAuth.js";

/**
 * Product admin routes (bookings, users, waitlist): accept cookie session with
 * role=admin, or fall back to Basic Auth / open local mode via protectAdminTools.
 */
export const protectProductAdmin: RequestHandler = (req, res, next) => {
  void loadSession(req, res, (loadError) => {
    if (loadError) {
      next(loadError);
      return;
    }

    if (req.authUser?.role === "admin") {
      next();
      return;
    }

    if (!shouldProtectAdminTools()) {
      next();
      return;
    }

    protectAdminTools(req, res, next);
  });
};
