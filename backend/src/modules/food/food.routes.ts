import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { loadSession, requireSession } from "../auth/auth.middleware.js";
import {
  createAdminMenuItemController,
  createMyFoodOrderController,
  listAdminFoodOrdersController,
  listAdminMenuController,
  listMyMenuController,
  patchAdminFoodOrderController,
  patchAdminMenuItemController,
} from "./food.controller.js";
import {
  createFoodMenuItemBodySchema,
  createFoodOrderBodySchema,
  foodMenuItemIdParamsSchema,
  foodOrderIdParamsSchema,
  listAdminFoodOrdersQuerySchema,
  patchFoodMenuItemBodySchema,
  patchFoodOrderBodySchema,
} from "./food.schema.js";

export const foodMeRouter = Router();
export const foodAdminRouter = Router();

foodMeRouter.use(loadSession, requireSession);
foodMeRouter.get("/menu", asyncHandler(listMyMenuController));
foodMeRouter.post(
  "/orders",
  validateBody(createFoodOrderBodySchema),
  asyncHandler(createMyFoodOrderController),
);

foodAdminRouter.get("/menu", asyncHandler(listAdminMenuController));
foodAdminRouter.post(
  "/menu",
  validateBody(createFoodMenuItemBodySchema),
  asyncHandler(createAdminMenuItemController),
);
foodAdminRouter.patch(
  "/menu/:id",
  validateParams(foodMenuItemIdParamsSchema),
  validateBody(patchFoodMenuItemBodySchema),
  asyncHandler(patchAdminMenuItemController),
);
foodAdminRouter.get(
  "/orders",
  validateQuery(listAdminFoodOrdersQuerySchema),
  asyncHandler(listAdminFoodOrdersController),
);
foodAdminRouter.patch(
  "/orders/:id",
  validateParams(foodOrderIdParamsSchema),
  validateBody(patchFoodOrderBodySchema),
  asyncHandler(patchAdminFoodOrderController),
);
