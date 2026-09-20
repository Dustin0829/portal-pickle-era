import { facilitySettingsQueryKey } from "@/api/features/facility-settings/use-facility-settings";
import type { FacilitySettingsDto } from "@/api/features/facility-settings/facility-settings.schema";
import { fallbackFacilitySettings } from "@/lib/facility/facilitySettingsView";
import { queryClient } from "@/providers/QueryProvider";

export function seedFacilitySettings(
  patch?: Partial<FacilitySettingsDto>,
): FacilitySettingsDto {
  const base = fallbackFacilitySettings();
  const data: FacilitySettingsDto = {
    ...base,
    ...patch,
    planPrices: { ...base.planPrices, ...patch?.planPrices },
    openPlaySessions: patch?.openPlaySessions ?? base.openPlaySessions,
    paymentMethods: patch?.paymentMethods ?? base.paymentMethods,
  };
  queryClient.setQueryData(facilitySettingsQueryKey, data);
  return data;
}

export function clearFacilitySettingsCache() {
  queryClient.removeQueries({ queryKey: facilitySettingsQueryKey });
  localStorage.removeItem("pickle-era-facility-settings");
}
