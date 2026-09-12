import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PAYMENT, PLAN_META, type BookingPlan } from "@/lib/booking/booking";

export type PlanSettings = {
  title: string;
  price: number;
  unit: string;
};

export type PaymentSettings = {
  method: string;
  name: string;
  number: string;
};

type FacilitySettingsState = {
  plans: Record<BookingPlan, PlanSettings>;
  payment: PaymentSettings;
  setPlanPrice: (plan: BookingPlan, price: number) => void;
  setPayment: (payment: PaymentSettings) => void;
  resetDefaults: () => void;
};

const defaultPlans: Record<BookingPlan, PlanSettings> = {
  court: {
    title: PLAN_META.court.title,
    price: PLAN_META.court.price,
    unit: PLAN_META.court.unit,
  },
  "open-play": {
    title: PLAN_META["open-play"].title,
    price: PLAN_META["open-play"].price,
    unit: PLAN_META["open-play"].unit,
  },
  clinic: {
    title: PLAN_META.clinic.title,
    price: PLAN_META.clinic.price,
    unit: PLAN_META.clinic.unit,
  },
};

const defaultPayment: PaymentSettings = { ...PAYMENT };

export const useFacilitySettingsStore = create<FacilitySettingsState>()(
  persist(
    (set) => ({
      plans: defaultPlans,
      payment: defaultPayment,
      setPlanPrice: (plan, price) =>
        set((state) => ({
          plans: {
            ...state.plans,
            [plan]: { ...state.plans[plan], price },
          },
        })),
      setPayment: (payment) => set({ payment }),
      resetDefaults: () =>
        set({ plans: defaultPlans, payment: defaultPayment }),
    }),
    { name: "pickle-era-facility-settings" },
  ),
);
