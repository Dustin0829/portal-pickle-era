import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { BookingPlan } from "@/lib/booking/booking";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";

const PLAN_ORDER: BookingPlan[] = ["court", "open-play", "clinic"];

type PriceDraft = Record<BookingPlan, number>;

function pricesFromPlans(
  plans: Record<BookingPlan, { price: number }>,
): PriceDraft {
  return {
    court: plans.court.price,
    "open-play": plans["open-play"].price,
    clinic: plans.clinic.price,
  };
}

export function AdminSettingsPage() {
  const {
    plans,
    payment,
    preSignup,
    setPlanPrice,
    setPayment,
    setPreSignup,
    resetDefaults,
  } = useFacilitySettingsStore();
  const [paymentDraft, setPaymentDraft] = useState(payment);
  const [priceDraft, setPriceDraft] = useState<PriceDraft>(() =>
    pricesFromPlans(plans),
  );
  const [saved, setSaved] = useState(false);
  const [pricesSaved, setPricesSaved] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);

  useEffect(() => {
    setPriceDraft(pricesFromPlans(plans));
  }, [plans]);

  function onSavePayment(event: FormEvent) {
    event.preventDefault();
    setPayment(paymentDraft);
    setSaved(true);
  }

  function onSavePrices(event: FormEvent) {
    event.preventDefault();
    setSavingPrices(true);
    setPricesSaved(false);
    for (const plan of PLAN_ORDER) {
      setPlanPrice(plan, Math.max(0, Number(priceDraft[plan]) || 0));
    }
    window.setTimeout(() => {
      setSavingPrices(false);
      setPricesSaved(true);
    }, 200);
  }

  function onResetDefaults() {
    resetDefaults();
    setPaymentDraft(useFacilitySettingsStore.getState().payment);
    setPriceDraft(pricesFromPlans(useFacilitySettingsStore.getState().plans));
    setSaved(false);
    setPricesSaved(false);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-[36px] text-zinc-900 sm:text-[44px]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Save plan prices and GCash display for marketing Pricing and booking
            amounts in this browser.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetDefaults}
          className="shrink-0"
        >
          Reset defaults
        </Button>
      </header>

      <section className="mb-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
              Pre-signup (legacy)
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              Marketing Book CTAs open the booking modal. This toggle is unused
              for CTAs and kept only for local settings compatibility.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preSignup}
            aria-label="Pre-signup mode"
            onClick={() => setPreSignup(!preSignup)}
            className={
              preSignup
                ? "relative h-8 w-14 shrink-0 rounded-full bg-yellow transition"
                : "relative h-8 w-14 shrink-0 rounded-full bg-zinc-200 transition"
            }
          >
            <span
              className={
                preSignup
                  ? "absolute top-1 left-7 size-6 rounded-full bg-black transition"
                  : "absolute top-1 left-1 size-6 rounded-full bg-white transition"
              }
            />
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
            Plan prices
          </h2>
          <form className="mt-3 flex flex-col gap-2.5" onSubmit={onSavePrices}>
            <ul className="flex flex-col gap-2.5">
              {PLAN_ORDER.map((plan) => (
                <li
                  key={plan}
                  className="flex items-center justify-between gap-3"
                >
                  <label
                    className="min-w-0 text-sm text-zinc-600"
                    htmlFor={`price-${plan}`}
                  >
                    {plans[plan].title}
                    <span className="mt-0.5 block text-[11px] text-zinc-400">
                      {plans[plan].unit}
                    </span>
                  </label>
                  <div className="relative shrink-0">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                      ₱
                    </span>
                    <input
                      id={`price-${plan}`}
                      type="number"
                      min={0}
                      step={1}
                      value={priceDraft[plan]}
                      onChange={(event) => {
                        setPricesSaved(false);
                        setPriceDraft((prev) => ({
                          ...prev,
                          [plan]: Number(event.target.value) || 0,
                        }));
                      }}
                      className="h-9 w-28 rounded-xl border border-zinc-200 bg-white pl-7 pr-3 text-sm text-zinc-900 outline-none focus:border-yellow"
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Button type="submit" className="w-fit" disabled={savingPrices}>
                {savingPrices ? "Saving…" : "Save"}
              </Button>
              {pricesSaved ? (
                <p className="text-xs text-zinc-500" role="status">
                  Saved locally.
                </p>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
            GCash display
          </h2>
          <form className="mt-3 flex flex-col gap-2.5" onSubmit={onSavePayment}>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Method
              <input
                value={paymentDraft.method}
                onChange={(event) =>
                  setPaymentDraft((prev) => ({
                    ...prev,
                    method: event.target.value,
                  }))
                }
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Account name
              <input
                value={paymentDraft.name}
                onChange={(event) =>
                  setPaymentDraft((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Number
              <input
                value={paymentDraft.number}
                onChange={(event) =>
                  setPaymentDraft((prev) => ({
                    ...prev,
                    number: event.target.value,
                  }))
                }
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
              />
            </label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Button type="submit" className="w-fit">
                Save payment display
              </Button>
              {saved ? (
                <p className="text-xs text-zinc-500" role="status">
                  Saved locally.
                </p>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
