import api from "@/api/client";
import {
  facilitySettingsDtoSchema,
  patchFacilitySettingsBodySchema,
  type FacilitySettingsDto,
  type PatchFacilitySettingsBody,
} from "@/api/features/facility-settings/facility-settings.schema";

export async function getFacilitySettings(
  signal?: AbortSignal,
): Promise<FacilitySettingsDto> {
  const { data } = await api.get("/facility-settings", { signal });
  return facilitySettingsDtoSchema.parse(data);
}

export async function patchFacilitySettings(
  input: PatchFacilitySettingsBody,
): Promise<FacilitySettingsDto> {
  const body = patchFacilitySettingsBodySchema.parse(input);
  const { data } = await api.patch("/admin/facility-settings", body);
  return facilitySettingsDtoSchema.parse(data);
}
