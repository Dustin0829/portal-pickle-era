import { PAYMENT } from "@/lib/booking/booking";

export type FacilityPaymentMethod = {
  id: string;
  /** Channel / bank label, e.g. GCash, Maya, BDO. */
  label: string;
  name: string;
  number: string;
  /** Optional uploaded QR as data URL (JPEG/PNG/WebP). */
  qrImageDataUrl: string | null;
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
      qrImageDataUrl: null,
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

/** Normalize persisted state: prefer paymentMethods; else seed from legacy payment. */
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
      qrImageDataUrl: method.qrImageDataUrl ?? null,
    }));
  }
  if (input.payment) {
    return [
      {
        id: "migrated-payment",
        label: input.payment.method || PAYMENT.method,
        name: input.payment.name || PAYMENT.name,
        number: input.payment.number || PAYMENT.number,
        qrImageDataUrl: null,
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

const MAX_QR_DATA_URL_CHARS = 600_000;

/** Read image file as data URL; rejects oversized / non-image. */
export function readQrImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.type)) {
      reject(new Error("QR must be a JPEG, PNG, or WebP image."));
      return;
    }
    if (file.size > 400_000) {
      reject(new Error("QR image must be under 400KB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result.startsWith("data:image/")) {
        reject(new Error("Could not read QR image."));
        return;
      }
      if (result.length > MAX_QR_DATA_URL_CHARS) {
        reject(new Error("QR image is too large after encoding."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Could not read QR image."));
    reader.readAsDataURL(file);
  });
}
