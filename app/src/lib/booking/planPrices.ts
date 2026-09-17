import {
  PLAN_META,
  getPlanUnitPrice,
  type BookingPlan,
} from "@/lib/booking/booking";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";

/** Saved facility unit price, falling back to `PLAN_META` defaults. */
export function readPlanUnitPrice(plan: BookingPlan) {
  const saved = useFacilitySettingsStore.getState().plans[plan]?.price;
  return getPlanUnitPrice(plan, saved);
}

/** React hook for saved facility unit price. */
export function usePlanUnitPrice(plan: BookingPlan) {
  return useFacilitySettingsStore(
    (state) => state.plans[plan]?.price ?? PLAN_META[plan].price,
  );
}

/** All saved plan prices keyed by plan. */
export function usePlanPrices() {
  return useFacilitySettingsStore((state) => state.plans);
}
