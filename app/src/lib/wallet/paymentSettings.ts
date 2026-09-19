import { PAYMENT } from "@/lib/booking/booking";
import {
  resolvePaymentMethods,
  type FacilityPaymentMethod,
  type PaymentSettings,
} from "@/lib/booking/paymentMethods";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";

/** Active cash channels for booking / wallet top-up. */
export function readPaymentMethods(): FacilityPaymentMethod[] {
  const state = useFacilitySettingsStore.getState();
  return resolvePaymentMethods({
    paymentMethods: state.paymentMethods,
    payment: state.payment,
  });
}

export function usePaymentMethods(): FacilityPaymentMethod[] {
  const paymentMethods = useFacilitySettingsStore((s) => s.paymentMethods);
  const payment = useFacilitySettingsStore((s) => s.payment);
  return resolvePaymentMethods({ paymentMethods, payment });
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
