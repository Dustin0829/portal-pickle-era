import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type { PresignUploadBody } from "./uploads.schema.js";
import { presignUpload } from "./uploads.service.js";

export async function presignUploadController(req: Request, res: Response) {
  const result = await presignUpload(req.body as PresignUploadBody);
  return sendSuccess(res, result);
}
