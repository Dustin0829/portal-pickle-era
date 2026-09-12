import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type { CreateWaitlistBody, ListWaitlistQuery } from "./waitlist.schema.js";
import { listWaitlistEntries, upsertWaitlistEntry } from "./waitlist.service.js";

export async function createWaitlistController(req: Request, res: Response) {
  const entry = await upsertWaitlistEntry(req.body as CreateWaitlistBody);
  return sendSuccess(res, entry, "ok", 200);
}

export async function listWaitlistController(req: Request, res: Response) {
  const result = await listWaitlistEntries(req.query as unknown as ListWaitlistQuery);
  return sendSuccess(res, { items: result.items }, "ok", 200, result.meta);
}
