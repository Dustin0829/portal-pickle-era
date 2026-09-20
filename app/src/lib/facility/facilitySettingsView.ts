import {
  PLAN_META,
  PAYMENT,
  SLOTS,
  formatHour,
  type BookingPlan,
  type TimeSlot,
} from "@/lib/booking/booking";
import type { FacilitySettingsDto } from "@/api/features/facility-settings/facility-settings.schema";
import type { FacilityPaymentMethod } from "@/lib/booking/paymentMethods";

export type PlanSettings = {
  title: string;
  price: number;
  unit: string;
};

function labelOpenPlayWindow(hour: number, durationHours = 2) {
  const duration = durationHours > 0 ? durationHours : 2;
  return `${formatHour(hour)} – ${formatHour(hour + duration)}`;
}

/** Hard-coded display fallback when GET fails — never write to localStorage. */
export function fallbackFacilitySettings(): FacilitySettingsDto {
  return {
    id: "default",
    planPrices: {
      court: PLAN_META.court.price,
      openPlay: PLAN_META["open-play"].price,
      clinic: PLAN_META.clinic.price,
    },
    openPlaySessions: SLOTS["open-play"].map((slot) => ({
      slotId: slot.id,
      hour: slot.hour,
      durationHours: slot.durationHours ?? 2,
    })),
    paymentMethods: [
      {
        id: "default-gcash",
        label: PAYMENT.method,
        name: PAYMENT.name,
        number: PAYMENT.number,
        qrImageKey: null,
        qrImageUrl: null,
        sortOrder: 0,
      },
    ],
    preSignup: false,
    updatedAt: new Date(0).toISOString(),
  };
}

export function plansFromSettings(
  settings: FacilitySettingsDto,
): Record<BookingPlan, PlanSettings> {
  return {
    court: {
      title: PLAN_META.court.title,
      price: settings.planPrices.court,
      unit: PLAN_META.court.unit,
    },
    "open-play": {
      title: PLAN_META["open-play"].title,
      price: settings.planPrices.openPlay,
      unit: PLAN_META["open-play"].unit,
    },
    clinic: {
      title: PLAN_META.clinic.title,
      price: settings.planPrices.clinic,
      unit: PLAN_META.clinic.unit,
    },
  };
}

export function openPlaySlotsFromSettings(
  settings: FacilitySettingsDto,
): TimeSlot[] {
  return settings.openPlaySessions.map((session) => ({
    id: session.slotId,
    hour: session.hour,
    durationHours: session.durationHours,
    label: labelOpenPlayWindow(session.hour, session.durationHours),
  }));
}

export function paymentMethodsFromSettings(
  settings: FacilitySettingsDto,
): FacilityPaymentMethod[] {
  return settings.paymentMethods.map((method) => ({
    id: method.id,
    label: method.label,
    name: method.name,
    number: method.number,
    qrImageKey: method.qrImageKey,
    qrImageUrl: method.qrImageUrl,
  }));
}
