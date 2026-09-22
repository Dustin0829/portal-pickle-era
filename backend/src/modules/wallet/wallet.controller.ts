import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type {
  CreateAdminManualCreditBody,
  CreateWalletTopUpBody,
  ListAdminTopUpsQuery,
  ListMyWalletTransactionsQuery,
  PatchTopUpBody,
} from "./wallet.schema.js";
import {
  createAdminManualCredit,
  createMyTopUp,
  getAdminWalletProfile,
  getMyWallet,
  getMyTopUpReceiptUrl,
  getTopUpReceiptUrl,
  listAdminTopUps,
  listMyWalletTransactions,
  patchTopUpStatus,
} from "./wallet.service.js";

export async function getMyWalletController(req: Request, res: Response) {
  const wallet = await getMyWallet(req.authUser);
  return sendSuccess(res, wallet, "ok", 200);
}

export async function listMyWalletTransactionsController(req: Request, res: Response) {
  const result = await listMyWalletTransactions(
    req.authUser,
    req.query as unknown as ListMyWalletTransactionsQuery,
  );
  return sendSuccess(res, { items: result.items }, "ok", 200, result.meta);
}

export async function createMyTopUpController(req: Request, res: Response) {
  const topUp = await createMyTopUp(req.authUser, req.body as CreateWalletTopUpBody);
  return sendSuccess(res, topUp, "ok", 201);
}

export async function listAdminTopUpsController(req: Request, res: Response) {
  const result = await listAdminTopUps(req.query as unknown as ListAdminTopUpsQuery);
  return sendSuccess(res, { items: result.items }, "ok", 200, result.meta);
}

export async function topUpReceiptUrlController(req: Request, res: Response) {
  const result = await getTopUpReceiptUrl(req.params.id as string);
  return sendSuccess(res, result, "ok", 200);
}

export async function myTopUpReceiptUrlController(req: Request, res: Response) {
  const result = await getMyTopUpReceiptUrl(req.params.id as string, req.authUser);
  return sendSuccess(res, result, "ok", 200);
}

export async function patchTopUpController(req: Request, res: Response) {
  const topUp = await patchTopUpStatus(req.params.id as string, req.body as PatchTopUpBody);
  return sendSuccess(res, topUp, "ok", 200);
}

export async function getAdminWalletProfileController(req: Request, res: Response) {
  const profile = await getAdminWalletProfile(req.params.userId as string);
  return sendSuccess(res, profile, "ok", 200);
}

export async function createAdminManualCreditController(req: Request, res: Response) {
  const result = await createAdminManualCredit(req.body as CreateAdminManualCreditBody);
  return sendSuccess(res, result, "ok", 201);
}
