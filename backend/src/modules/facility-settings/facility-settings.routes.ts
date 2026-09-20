import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody } from "../../middleware/validate.js";
import {
  getFacilitySettingsController,
  patchFacilitySettingsController,
} from "./facility-settings.controller.js";
import { patchFacilitySettingsBodySchema } from "./facility-settings.schema.js";

export const facilitySettingsPublicRouter = Router();
export const facilitySettingsAdminRouter = Router();

facilitySettingsPublicRouter.get("/", asyncHandler(getFacilitySettingsController));

facilitySettingsAdminRouter.patch(
  "/",
  validateBody(patchFacilitySettingsBodySchema),
  asyncHandler(patchFacilitySettingsController),
);
