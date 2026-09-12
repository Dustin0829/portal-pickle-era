import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { createWaitlistController, listWaitlistController } from "./waitlist.controller.js";
import { createWaitlistBodySchema, listWaitlistQuerySchema } from "./waitlist.schema.js";

export const waitlistPublicRouter = Router();
export const waitlistAdminRouter = Router();

waitlistPublicRouter.post(
  "/",
  validateBody(createWaitlistBodySchema),
  asyncHandler(createWaitlistController),
);

waitlistAdminRouter.get(
  "/",
  validateQuery(listWaitlistQuerySchema),
  asyncHandler(listWaitlistController),
);
