import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  createExampleController,
  getExampleController,
  listExamplesController,
} from "./examples.controller.js";
import {
  createExampleBodySchema,
  exampleParamsSchema,
  listExamplesQuerySchema,
} from "./examples.schema.js";

export const examplesRouter = Router();

examplesRouter.get(
  "/",
  validateQuery(listExamplesQuerySchema),
  asyncHandler(listExamplesController),
);
examplesRouter.get("/:id", validateParams(exampleParamsSchema), asyncHandler(getExampleController));
examplesRouter.post(
  "/",
  validateBody(createExampleBodySchema),
  asyncHandler(createExampleController),
);
