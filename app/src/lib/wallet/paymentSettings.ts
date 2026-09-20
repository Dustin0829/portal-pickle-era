import { PAYMENT } from "@/lib/booking/booking";
import {
  type FacilityPaymentMethod,
  type PaymentSettings,
} from "@/lib/booking/paymentMethods";
import { facilitySettingsQueryKey } from "@/api/features/facility-settings/use-facility-settings";
import type { FacilitySettingsDto } from "@/api/features/facility-settings/facility-settings.schema";
import {
  fallbackFacilitySettings,
  paymentMethodsFromSettings,
} from "@/lib/facility/facilitySettingsView";
import { queryClient } from "@/providers/QueryProvider";
import { useFacilitySettings } from "@/api/features/facility-settings/use-facility-settings";

function cachedOrFallback(): FacilitySettingsDto {
  return (
    queryClient.getQueryData<FacilitySettingsDto>(facilitySettingsQueryKey) ??
    fallbackFacilitySettings()
  );
}

/** Active cash channels for booking / wallet top-up. */
export function readPaymentMethods(): FacilityPaymentMethod[] {
  return paymentMethodsFromSettings(cachedOrFallback());
}

export function usePaymentMethods(): FacilityPaymentMethod[] {
  const { data } = useFacilitySettings();
  return paymentMethodsFromSettings(data ?? fallbackFacilitySettings());
}

/** @deprecated Prefer usePaymentMethods — returns first method. */
export function readPaymentSettings(): PaymentSettings {
  const [first] = readPaymentMethods();
  return {
    method: first?.label || PAYMENT.method,
    name: first?.name || PAYMENT.name,
    number: first?.number || PAYMENT.number,
  };
}

/** @deprecated Prefer usePaymentMethods — returns first method. */
export function usePaymentSettings(): PaymentSettings {
  const methods = usePaymentMethods();
  const first = methods[0];
  return {
    method: first?.label || PAYMENT.method,
    name: first?.name || PAYMENT.name,
    number: first?.number || PAYMENT.number,
  };
}
