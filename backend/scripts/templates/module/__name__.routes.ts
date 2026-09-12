import { Router } from "express";
import { asyncHandler } from "../../lib/api-response.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import {
  create{{Name}}Controller,
  get{{Name}}Controller,
  list{{Name}}Controller,
} from "./{{name}}.controller.js";
import { create{{Name}}BodySchema, {{camelName}}ParamsSchema } from "./{{name}}.schema.js";

export const {{camelName}}Router = Router();

{{camelName}}Router.get("/", asyncHandler(list{{Name}}Controller));
{{camelName}}Router.get("/:id", validateParams({{camelName}}ParamsSchema), asyncHandler(get{{Name}}Controller));
{{camelName}}Router.post("/", validateBody(create{{Name}}BodySchema), asyncHandler(create{{Name}}Controller));
