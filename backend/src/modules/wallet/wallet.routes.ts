import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { loadSession, requireSession } from "../auth/auth.middleware.js";
import {
  createAdminManualCreditController,
  createMyTopUpController,
  getAdminWalletProfileController,
  getMyWalletController,
  listAdminTopUpsController,
  listMyWalletTransactionsController,
  patchTopUpController,
  topUpReceiptUrlController,
} from "./wallet.controller.js";
import {
  adminUserIdParamsSchema,
  createAdminManualCreditBodySchema,
  createWalletTopUpBodySchema,
  listAdminTopUpsQuerySchema,
  listMyWalletTransactionsQuerySchema,
  patchTopUpBodySchema,
  topUpIdParamsSchema,
} from "./wallet.schema.js";

export const walletMeRouter = Router();
export const walletAdminRouter = Router();

walletMeRouter.use(loadSession, requireSession);
walletMeRouter.get("/", asyncHandler(getMyWalletController));
walletMeRouter.get(
  "/transactions",
  validateQuery(listMyWalletTransactionsQuerySchema),
  asyncHandler(listMyWalletTransactionsController),
);
walletMeRouter.post(
  "/top-ups",
  validateBody(createWalletTopUpBodySchema),
  asyncHandler(createMyTopUpController),
);

walletAdminRouter.post(
  "/manual-credits",
  validateBody(createAdminManualCreditBodySchema),
  asyncHandler(createAdminManualCreditController),
);
walletAdminRouter.get(
  "/users/:userId/profile",
  validateParams(adminUserIdParamsSchema),
  asyncHandler(getAdminWalletProfileController),
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
