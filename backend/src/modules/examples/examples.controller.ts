import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type { CreateExampleBody, ExampleParams, ListExamplesQuery } from "./examples.schema.js";
import { createExample, getExample, listExamples } from "./examples.service.js";

export async function listExamplesController(req: Request, res: Response) {
  const result = await listExamples(req.query as unknown as ListExamplesQuery);
  return sendSuccess(res, { items: result.items }, "ok", 200, result.meta);
}

export async function getExampleController(req: Request, res: Response) {
  const { id } = req.params as ExampleParams;
  const example = await getExample(id);
  return sendSuccess(res, example);
}

export async function createExampleController(req: Request, res: Response) {
  const example = await createExample(req.body as CreateExampleBody);
  return sendSuccess(res, example, "created", 201);
}
