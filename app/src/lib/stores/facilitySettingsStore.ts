import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PLAN_META,
  SLOTS,
  type BookingPlan,
  type TimeSlot,
} from "@/lib/booking/booking";
import {
  defaultPaymentMethods,
  paymentMethodToSettings,
  resolvePaymentMethods,
  type FacilityPaymentMethod,
  type PaymentSettings,
} from "@/lib/booking/paymentMethods";

export type { FacilityPaymentMethod, PaymentSettings };

export type PlanSettings = {
  title: string;
  price: number;
  unit: string;
};

export type OpenPlaySlotSettings = TimeSlot;

type FacilitySettingsState = {
  plans: Record<BookingPlan, PlanSettings>;
  /** @deprecated Prefer paymentMethods; mirrored from methods[0] for old callers. */
  payment: PaymentSettings;
  paymentMethods: FacilityPaymentMethod[];
  openPlaySlots: OpenPlaySlotSettings[];
  /** Legacy toggle — Book CTAs open booking; kept for persisted settings. */
  preSignup: boolean;
  setPlanPrice: (plan: BookingPlan, price: number) => void;
  setPayment: (payment: PaymentSettings) => void;
  setPaymentMethods: (methods: FacilityPaymentMethod[]) => void;
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

const defaultMethods = defaultPaymentMethods();
const defaultPayment = paymentMethodToSettings(defaultMethods[0]!);

const defaultOpenPlaySlots: OpenPlaySlotSettings[] = SLOTS["open-play"].map(
  (slot) => ({ ...slot }),
);

function withMirroredPayment(methods: FacilityPaymentMethod[]): {
  paymentMethods: FacilityPaymentMethod[];
  payment: PaymentSettings;
} {
  const resolved = resolvePaymentMethods({ paymentMethods: methods });
  return {
    paymentMethods: resolved,
    payment: paymentMethodToSettings(resolved[0]!),
  };
}

export const useFacilitySettingsStore = create<FacilitySettingsState>()(
  persist(
    (set) => ({
      plans: defaultPlans,
      payment: defaultPayment,
      paymentMethods: defaultMethods,
      openPlaySlots: defaultOpenPlaySlots,
      preSignup: false,
      setPlanPrice: (plan, price) =>
        set((state) => ({
          plans: {
            ...state.plans,
            [plan]: { ...state.plans[plan], price },
          },
        })),
      setPayment: (payment) =>
        set((state) => {
          const methods = [...state.paymentMethods];
          if (methods.length === 0) {
            return withMirroredPayment([
              {
                id: "from-set-payment",
                label: payment.method,
                name: payment.name,
                number: payment.number,
                qrImageDataUrl: null,
              },
            ]);
          }
          methods[0] = {
            ...methods[0]!,
            label: payment.method,
            name: payment.name,
            number: payment.number,
          };
          return withMirroredPayment(methods);
        }),
      setPaymentMethods: (paymentMethods) =>
        set(() => withMirroredPayment(paymentMethods)),
      setOpenPlaySlots: (openPlaySlots) => set({ openPlaySlots }),
      setPreSignup: (preSignup) => set({ preSignup }),
      resetDefaults: () =>
        set({
          plans: defaultPlans,
          ...withMirroredPayment(defaultPaymentMethods()),
          openPlaySlots: defaultOpenPlaySlots.map((slot) => ({ ...slot })),
          preSignup: false,
        }),
    }),
    {
      name: "pickle-era-facility-settings",
      merge: (persisted, current) => {
        const raw = (persisted ?? {}) as Partial<FacilitySettingsState>;
        const methods = resolvePaymentMethods({
          paymentMethods: raw.paymentMethods,
          payment: raw.payment,
        });
        return {
          ...current,
          ...raw,
          ...withMirroredPayment(methods),
        };
      },
    },
  ),
);
