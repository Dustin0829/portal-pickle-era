import type { Request, Response } from "express";
import { sendSuccess } from "../../lib/api-response.js";
import type { PatchFacilitySettingsBody } from "./facility-settings.schema.js";
import { getFacilitySettings, patchFacilitySettings } from "./facility-settings.service.js";

export async function getFacilitySettingsController(_req: Request, res: Response) {
  return sendSuccess(res, await getFacilitySettings(), "ok", 200);
}

export async function patchFacilitySettingsController(req: Request, res: Response) {
  const settings = await patchFacilitySettings(req.body as PatchFacilitySettingsBody);
  return sendSuccess(res, settings, "ok", 200);
}
