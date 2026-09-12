import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { dbHealthController, healthController } from "./health.controller.js";

export const healthRouter = Router();

healthRouter.get("/", healthController);
healthRouter.get("/db", asyncHandler(dbHealthController));
