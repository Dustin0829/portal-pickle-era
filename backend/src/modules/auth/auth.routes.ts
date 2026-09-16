import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody } from "../../middleware/validate.js";
import {
  loginController,
  logoutController,
  meController,
  patchMeController,
  signupController,
} from "./auth.controller.js";
import { loadSession, requireSession } from "./auth.middleware.js";
import { loginBodySchema, patchMeBodySchema, signupBodySchema } from "./auth.schema.js";

export const authRouter = Router();

authRouter.use(loadSession);

authRouter.post("/signup", validateBody(signupBodySchema), asyncHandler(signupController));
authRouter.post("/login", validateBody(loginBodySchema), asyncHandler(loginController));
authRouter.post("/logout", asyncHandler(logoutController));
authRouter.get("/me", requireSession, asyncHandler(meController));
authRouter.patch(
  "/me",
  requireSession,
  validateBody(patchMeBodySchema),
  asyncHandler(patchMeController),
);
