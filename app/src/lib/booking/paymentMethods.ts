import { PAYMENT } from "@/lib/booking/booking";

export type FacilityPaymentMethod = {
  id: string;
  /** Channel / bank label, e.g. GCash, Maya, BDO. */
  label: string;
  name: string;
  number: string;
  /** Object storage key after presign upload. */
  qrImageKey: string | null;
  /** Presigned (or local preview) URL for display. */
  qrImageUrl: string | null;
};

/** Legacy single-payment shape kept for migrate + thin callers. */
export type PaymentSettings = {
  method: string;
  name: string;
  number: string;
};

export function defaultPaymentMethods(): FacilityPaymentMethod[] {
  return [
    {
      id: "default-gcash",
      label: PAYMENT.method,
      name: PAYMENT.name,
      number: PAYMENT.number,
      qrImageKey: null,
      qrImageUrl: null,
    },
  ];
}

export function paymentMethodToSettings(
  method: FacilityPaymentMethod,
): PaymentSettings {
  return {
    method: method.label,
    name: method.name,
    number: method.number,
  };
}

/** Normalize methods list; seed from legacy payment or defaults. */
export function resolvePaymentMethods(input: {
  paymentMethods?: FacilityPaymentMethod[] | null;
  payment?: PaymentSettings | null;
}): FacilityPaymentMethod[] {
  if (input.paymentMethods && input.paymentMethods.length > 0) {
    return input.paymentMethods.map((method) => ({
      id: method.id || cryptoRandomId(),
      label: method.label?.trim() || PAYMENT.method,
      name: method.name?.trim() || PAYMENT.name,
      number: method.number?.trim() || PAYMENT.number,
      qrImageKey: method.qrImageKey ?? null,
      qrImageUrl: method.qrImageUrl ?? null,
    }));
  }
  if (input.payment) {
    return [
      {
        id: "migrated-payment",
        label: input.payment.method || PAYMENT.method,
        name: input.payment.name || PAYMENT.name,
        number: input.payment.number || PAYMENT.number,
        qrImageKey: null,
        qrImageUrl: null,
      },
    ];
  }
  return defaultPaymentMethods();
}

export function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
