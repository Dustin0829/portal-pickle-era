import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type {
  CreateFoodMenuItemBody,
  CreateFoodOrderBody,
  ListAdminFoodOrdersQuery,
  PatchFoodMenuItemBody,
  PatchFoodOrderBody,
} from "./food.schema.js";
import {
  createMenuItem,
  createMyFoodOrder,
  listAdminFoodOrders,
  listAdminMenu,
  listAvailableMenu,
  listMyFoodOrders,
  patchFoodOrderStatus,
  patchMenuItem,
} from "./food.service.js";

export async function listMyMenuController(_req: Request, res: Response) {
  return sendSuccess(res, await listAvailableMenu(), "ok", 200);
}

export async function listMyFoodOrdersController(req: Request, res: Response) {
  return sendSuccess(res, await listMyFoodOrders(req.authUser), "ok", 200);
}

export async function createMyFoodOrderController(req: Request, res: Response) {
  const order = await createMyFoodOrder(req.authUser, req.body as CreateFoodOrderBody);
  return sendSuccess(res, order, "ok", 201);
}

export async function listAdminMenuController(_req: Request, res: Response) {
  return sendSuccess(res, await listAdminMenu(), "ok", 200);
}

export async function createAdminMenuItemController(req: Request, res: Response) {
  const item = await createMenuItem(req.body as CreateFoodMenuItemBody);
  return sendSuccess(res, item, "ok", 201);
}

export async function patchAdminMenuItemController(req: Request, res: Response) {
  const item = await patchMenuItem(req.params.id as string, req.body as PatchFoodMenuItemBody);
  return sendSuccess(res, item, "ok", 200);
}

export async function listAdminFoodOrdersController(req: Request, res: Response) {
  const result = await listAdminFoodOrders(req.query as unknown as ListAdminFoodOrdersQuery);
  return sendSuccess(res, result, "ok", 200);
}

export async function patchAdminFoodOrderController(req: Request, res: Response) {
  const order = await patchFoodOrderStatus(req.params.id as string, req.body as PatchFoodOrderBody);
  return sendSuccess(res, order, "ok", 200);
}
