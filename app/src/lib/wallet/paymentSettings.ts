import { PAYMENT } from "@/lib/booking/booking";
import {
  useFacilitySettingsStore,
  type PaymentSettings,
} from "@/lib/stores/facilitySettingsStore";

/** Saved GCash display settings, falling back to booking defaults. */
export function readPaymentSettings(): PaymentSettings {
  const saved = useFacilitySettingsStore.getState().payment;
  return {
    method: saved.method || PAYMENT.method,
    name: saved.name || PAYMENT.name,
    number: saved.number || PAYMENT.number,
  };
}

/** React hook for facility GCash / payment display. */
export function usePaymentSettings(): PaymentSettings {
  const payment = useFacilitySettingsStore((state) => state.payment);
  return {
    method: payment.method || PAYMENT.method,
    name: payment.name || PAYMENT.name,
    number: payment.number || PAYMENT.number,
  };
}
