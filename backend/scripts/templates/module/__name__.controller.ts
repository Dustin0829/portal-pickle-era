import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type { Create{{Name}}Body, {{Name}}Params } from "./{{name}}.schema.js";
import { create{{Name}}, get{{Name}}, list{{Name}} } from "./{{name}}.service.js";

export async function list{{Name}}Controller(_req: Request, res: Response) {
  const items = await list{{Name}}();
  return sendSuccess(res, { items });
}

export async function get{{Name}}Controller(req: Request, res: Response) {
  const { id } = req.params as {{Name}}Params;
  const row = await get{{Name}}(id);
  return sendSuccess(res, row);
}

export async function create{{Name}}Controller(req: Request, res: Response) {
  const row = await create{{Name}}(req.body as Create{{Name}}Body);
  return sendSuccess(res, row, "created", 201);
}
