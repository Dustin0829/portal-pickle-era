import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { BookablePlan, TimeSlot } from "@/lib/booking/booking";
import {
  previewCoveredHours,
  slotFromOpenPlayHour,
} from "@/lib/booking/openPlaySlots";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";
import { FoodMenuSettingsSection } from "@/pages/admin/settings/FoodMenuSettingsSection";
import { PaymentMethodsSettingsSection } from "@/pages/admin/settings/PaymentMethodsSettingsSection";
import { cn } from "@/lib/utils";

const PLAN_ORDER: BookablePlan[] = ["court", "open-play"];
const START_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

type SettingsTab = "prices" | "open-play" | "payment" | "food";

type PriceDraft = Record<BookablePlan, number>;

function pricesFromPlans(plans: Record<string, { price: number }>): PriceDraft {
  return {
    court: plans.court.price,
    "open-play": plans["open-play"].price,
  };
}

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "prices", label: "Prices" },
  { id: "open-play", label: "Open play sessions" },
  { id: "payment", label: "Payment methods" },
  { id: "food", label: "Food menu" },
];

export function AdminSettingsPage() {
  const {
    plans,
    openPlaySlots,
    preSignup,
    setPlanPrice,
    setOpenPlaySlots,
    setPreSignup,
    resetDefaults,
  } = useFacilitySettingsStore();
  const [tab, setTab] = useState<SettingsTab>("prices");
  const [priceDraft, setPriceDraft] = useState<PriceDraft>(() =>
    pricesFromPlans(plans),
  );
  const [slotsDraft, setSlotsDraft] = useState<TimeSlot[]>(() =>
    openPlaySlots.map((slot) => ({ ...slot })),
  );
  const [pricesSaved, setPricesSaved] = useState(false);
  const [slotsSaved, setSlotsSaved] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [savingSlots, setSavingSlots] = useState(false);

  useEffect(() => {
    setPriceDraft(pricesFromPlans(plans));
  }, [plans]);

  useEffect(() => {
    setSlotsDraft(openPlaySlots.map((slot) => ({ ...slot })));
  }, [openPlaySlots]);

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

  function onSaveSlots(event: FormEvent) {
    event.preventDefault();
    setSavingSlots(true);
    setSlotsSaved(false);
    const next = [...slotsDraft]
      .map((slot) => slotFromOpenPlayHour(slot.hour, slot.durationHours ?? 2))
      .sort((a, b) => a.hour - b.hour);
    setOpenPlaySlots(next);
    window.setTimeout(() => {
      setSavingSlots(false);
      setSlotsSaved(true);
    }, 200);
  }

  function onResetDefaults() {
    resetDefaults();
    const state = useFacilitySettingsStore.getState();
    setPriceDraft(pricesFromPlans(state.plans));
    setSlotsDraft(state.openPlaySlots.map((slot) => ({ ...slot })));
    setPricesSaved(false);
    setSlotsSaved(false);
  }

  function addSlot() {
    setSlotsSaved(false);
    const used = new Set(slotsDraft.map((slot) => slot.hour));
    const hour = START_HOURS.find((value) => !used.has(value)) ?? 7;
    setSlotsDraft((prev) =>
      [...prev, slotFromOpenPlayHour(hour)].sort((a, b) => a.hour - b.hour),
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-5">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-[36px] text-zinc-900 sm:text-[44px]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Plan prices, Open Play sessions, payment display, and food menu.
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

      <div
        role="tablist"
        aria-label="Settings sections"
        className="mb-4 flex flex-wrap gap-1 border-b border-zinc-200"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            id={`settings-tab-${item.id}`}
            onClick={() => setTab(item.id)}
            className={cn(
              "px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition",
              tab === item.id
                ? "border-b-2 border-yellow text-zinc-900"
                : "text-zinc-500 hover:text-zinc-800",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "prices" ? (
        <div
          role="tabpanel"
          aria-labelledby="settings-tab-prices"
          className="space-y-4"
        >
          <section className="border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
                  Pre-signup (legacy)
                </h2>
                <p className="mt-1.5 text-sm text-zinc-500">
                  Marketing Book CTAs open the booking modal. This toggle is
                  unused for CTAs and kept only for local settings
                  compatibility.
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

          <section className="border border-zinc-200 bg-white p-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
              Plan prices
            </h2>
            <form
              className="mt-3 flex flex-col gap-2.5"
              onSubmit={onSavePrices}
            >
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
                        className="h-9 w-28 border border-zinc-200 bg-white pl-7 pr-3 text-sm text-zinc-900 outline-none focus:border-yellow"
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
        </div>
      ) : null}

      {tab === "open-play" ? (
        <section
          role="tabpanel"
          aria-labelledby="settings-tab-open-play"
          className="border border-zinc-200 bg-white p-4"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
            Open Play sessions
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500">
            Set session start and duration. Covered court hours are blocked
            facility-wide. Saved sessions appear on Open Play booking (this
            browser).
          </p>
          <form className="mt-3 flex flex-col gap-2.5" onSubmit={onSaveSlots}>
            <ul className="flex flex-col gap-2">
              {slotsDraft.map((slot, index) => (
                <li
                  key={`${slot.id}-${index}`}
                  className="flex flex-col gap-2 border border-zinc-100 bg-zinc-50/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <label className="text-sm text-zinc-600">
                      Session {index + 1}
                      <span className="mt-0.5 block text-[11px] text-zinc-400">
                        {slot.label}
                      </span>
                    </label>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      Covers {previewCoveredHours(slot).join(", ") || "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label={`Start hour for session ${index + 1}`}
                      value={slot.hour}
                      onChange={(event) => {
                        setSlotsSaved(false);
                        const hour = Number(event.target.value);
                        setSlotsDraft((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? slotFromOpenPlayHour(
                                  hour,
                                  item.durationHours ?? 2,
                                )
                              : item,
                          ),
                        );
                      }}
                      className="h-9 border border-zinc-200 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-yellow"
                    >
                      {START_HOURS.map((hour) => (
                        <option key={hour} value={hour}>
                          {
                            slotFromOpenPlayHour(hour, slot.durationHours ?? 2)
                              .label
                          }
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label={`Duration for session ${index + 1}`}
                      value={slot.durationHours ?? 2}
                      onChange={(event) => {
                        setSlotsSaved(false);
                        const durationHours = Number(event.target.value);
                        setSlotsDraft((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? slotFromOpenPlayHour(item.hour, durationHours)
                              : item,
                          ),
                        );
                      }}
                      className="h-9 border border-zinc-200 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-yellow"
                    >
                      {[1, 2, 3, 4].map((hours) => (
                        <option key={hours} value={hours}>
                          {hours}h
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={slotsDraft.length <= 1}
                      onClick={() => {
                        setSlotsSaved(false);
                        setSlotsDraft((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSlot}
                disabled={slotsDraft.length >= START_HOURS.length}
              >
                Add session
              </Button>
              <Button type="submit" className="w-fit" disabled={savingSlots}>
                {savingSlots ? "Saving…" : "Save"}
              </Button>
              {slotsSaved ? (
                <p className="text-xs text-zinc-500" role="status">
                  Saved locally.
                </p>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}

      {tab === "payment" ? <PaymentMethodsSettingsSection /> : null}

      {tab === "food" ? (
        <div role="tabpanel" aria-labelledby="settings-tab-food">
          <FoodMenuSettingsSection />
        </div>
      ) : null}
    </div>
  );
}
