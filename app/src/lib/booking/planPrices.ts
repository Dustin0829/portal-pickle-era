import {
  PLAN_META,
  getPlanUnitPrice,
  type BookingPlan,
} from "@/lib/booking/booking";
import { facilitySettingsQueryKey } from "@/api/features/facility-settings/use-facility-settings";
import type { FacilitySettingsDto } from "@/api/features/facility-settings/facility-settings.schema";
import {
  fallbackFacilitySettings,
  plansFromSettings,
  type PlanSettings,
} from "@/lib/facility/facilitySettingsView";
import { queryClient } from "@/providers/QueryProvider";
import { useFacilitySettings } from "@/api/features/facility-settings/use-facility-settings";

export type { PlanSettings };

function cachedOrFallback(): FacilitySettingsDto {
  return (
    queryClient.getQueryData<FacilitySettingsDto>(facilitySettingsQueryKey) ??
    fallbackFacilitySettings()
  );
}

/** Saved facility unit price, falling back to `PLAN_META` defaults. */
export function readPlanUnitPrice(plan: BookingPlan) {
  const plans = plansFromSettings(cachedOrFallback());
  return getPlanUnitPrice(plan, plans[plan]?.price);
}

/** React hook for saved facility unit price. */
export function usePlanUnitPrice(plan: BookingPlan) {
  const { data } = useFacilitySettings();
  const plans = plansFromSettings(data ?? fallbackFacilitySettings());
  return plans[plan]?.price ?? PLAN_META[plan].price;
}

/** All saved plan prices keyed by plan. */
export function usePlanPrices() {
  const { data } = useFacilitySettings();
  return plansFromSettings(data ?? fallbackFacilitySettings());
}
