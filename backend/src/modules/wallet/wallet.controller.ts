import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type {
  CreateWalletTopUpBody,
  ListAdminTopUpsQuery,
  PatchTopUpBody,
} from "./wallet.schema.js";
import {
  createMyTopUp,
  getMyWallet,
  getTopUpReceiptUrl,
  listAdminTopUps,
  patchTopUpStatus,
} from "./wallet.service.js";

export async function getMyWalletController(req: Request, res: Response) {
  const wallet = await getMyWallet(req.authUser);
  return sendSuccess(res, wallet, "ok", 200);
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

export async function patchTopUpController(req: Request, res: Response) {
  const topUp = await patchTopUpStatus(req.params.id as string, req.body as PatchTopUpBody);
  return sendSuccess(res, topUp, "ok", 200);
}
