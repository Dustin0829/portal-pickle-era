import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PAYMENT,
  PLAN_META,
  SLOTS,
  type BookingPlan,
  type TimeSlot,
} from "@/lib/booking/booking";

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

export type OpenPlaySlotSettings = TimeSlot;

type FacilitySettingsState = {
  plans: Record<BookingPlan, PlanSettings>;
  payment: PaymentSettings;
  openPlaySlots: OpenPlaySlotSettings[];
  /** Legacy toggle — Book CTAs open booking; kept for persisted settings. */
  preSignup: boolean;
  setPlanPrice: (plan: BookingPlan, price: number) => void;
  setPayment: (payment: PaymentSettings) => void;
  setOpenPlaySlots: (slots: OpenPlaySlotSettings[]) => void;
  setPreSignup: (enabled: boolean) => void;
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

const defaultOpenPlaySlots: OpenPlaySlotSettings[] = SLOTS["open-play"].map(
  (slot) => ({ ...slot }),
);

export const useFacilitySettingsStore = create<FacilitySettingsState>()(
  persist(
    (set) => ({
      plans: defaultPlans,
      payment: defaultPayment,
      openPlaySlots: defaultOpenPlaySlots,
      preSignup: false,
      setPlanPrice: (plan, price) =>
        set((state) => ({
          plans: {
            ...state.plans,
            [plan]: { ...state.plans[plan], price },
          },
        })),
      setPayment: (payment) => set({ payment }),
      setOpenPlaySlots: (openPlaySlots) => set({ openPlaySlots }),
      setPreSignup: (preSignup) => set({ preSignup }),
      resetDefaults: () =>
        set({
          plans: defaultPlans,
          payment: defaultPayment,
          openPlaySlots: defaultOpenPlaySlots.map((slot) => ({ ...slot })),
          preSignup: false,
        }),
    }),
    { name: "pickle-era-facility-settings" },
  ),
);
