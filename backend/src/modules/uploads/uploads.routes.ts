import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody } from "../../middleware/validate.js";
import { presignUploadController } from "./uploads.controller.js";
import { presignUploadBodySchema } from "./uploads.schema.js";

export const uploadsRouter = Router();

uploadsRouter.post(
  "/presign",
  validateBody(presignUploadBodySchema),
  asyncHandler(presignUploadController),
);
