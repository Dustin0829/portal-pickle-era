import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody } from "../../middleware/validate.js";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  patchMeController,
  resetPasswordController,
  signupController,
} from "./auth.controller.js";
import { loadSession, requireSession } from "./auth.middleware.js";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  patchMeBodySchema,
  resetPasswordBodySchema,
  signupBodySchema,
} from "./auth.schema.js";

export const authRouter = Router();

authRouter.use(loadSession);

authRouter.post("/signup", validateBody(signupBodySchema), asyncHandler(signupController));
authRouter.post("/login", validateBody(loginBodySchema), asyncHandler(loginController));
authRouter.post("/logout", asyncHandler(logoutController));
authRouter.post(
  "/forgot-password",
  validateBody(forgotPasswordBodySchema),
  asyncHandler(forgotPasswordController),
);
authRouter.post(
  "/reset-password",
  validateBody(resetPasswordBodySchema),
  asyncHandler(resetPasswordController),
);
authRouter.get("/me", requireSession, asyncHandler(meController));
authRouter.patch(
  "/me",
  requireSession,
  validateBody(patchMeBodySchema),
  asyncHandler(patchMeController),
);
