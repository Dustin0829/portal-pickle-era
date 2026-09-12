import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type { ActivityLogParams, ListActivityLogsQuery } from "./activity-logs.schema.js";
import { getAdminActivityLog, listAdminActivityLogs } from "./activity-logs.service.js";

export async function listActivityLogsController(req: Request, res: Response) {
  const result = await listAdminActivityLogs(req.query as unknown as ListActivityLogsQuery);
  return sendSuccess(res, { items: result.items }, "ok", 200, result.meta);
}

export async function getActivityLogController(req: Request, res: Response) {
  const { id } = req.params as ActivityLogParams;
  const record = await getAdminActivityLog(id);
  return sendSuccess(res, record);
}
