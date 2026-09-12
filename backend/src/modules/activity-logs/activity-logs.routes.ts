import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateParams, validateQuery } from "../../middleware/validate.js";
import {
  getActivityLogController,
  listActivityLogsController,
} from "./activity-logs.controller.js";
import { activityLogParamsSchema, listActivityLogsQuerySchema } from "./activity-logs.schema.js";

export const activityLogsRouter = Router();

activityLogsRouter.get(
  "/",
  validateQuery(listActivityLogsQuerySchema),
  asyncHandler(listActivityLogsController),
);
activityLogsRouter.get(
  "/:id",
  validateParams(activityLogParamsSchema),
  asyncHandler(getActivityLogController),
);
