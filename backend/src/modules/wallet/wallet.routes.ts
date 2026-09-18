import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { loadSession, requireSession } from "../auth/auth.middleware.js";
import {
  createMyTopUpController,
  getMyWalletController,
  listAdminTopUpsController,
  patchTopUpController,
  topUpReceiptUrlController,
} from "./wallet.controller.js";
import {
  createWalletTopUpBodySchema,
  listAdminTopUpsQuerySchema,
  patchTopUpBodySchema,
  topUpIdParamsSchema,
} from "./wallet.schema.js";

export const walletMeRouter = Router();
export const walletAdminRouter = Router();

walletMeRouter.use(loadSession, requireSession);
walletMeRouter.get("/", asyncHandler(getMyWalletController));
walletMeRouter.post(
  "/top-ups",
  validateBody(createWalletTopUpBodySchema),
  asyncHandler(createMyTopUpController),
);

walletAdminRouter.get(
  "/top-ups",
  validateQuery(listAdminTopUpsQuerySchema),
  asyncHandler(listAdminTopUpsController),
);
walletAdminRouter.get(
  "/top-ups/:id/receipt-url",
  validateParams(topUpIdParamsSchema),
  asyncHandler(topUpReceiptUrlController),
);
walletAdminRouter.patch(
  "/top-ups/:id",
  validateParams(topUpIdParamsSchema),
  validateBody(patchTopUpBodySchema),
  asyncHandler(patchTopUpController),
);
