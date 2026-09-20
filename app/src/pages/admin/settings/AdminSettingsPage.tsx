import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppPageShell } from "@/components/layout/AppPageShell";
import type { BookablePlan, TimeSlot } from "@/lib/booking/booking";
import {
  previewCoveredHours,
  slotFromOpenPlayHour,
} from "@/lib/booking/openPlaySlots";
import {
  useFacilitySettings,
  usePatchFacilitySettings,
} from "@/api/features/facility-settings/use-facility-settings";
import {
  fallbackFacilitySettings,
  openPlaySlotsFromSettings,
  plansFromSettings,
} from "@/lib/facility/facilitySettingsView";
import { FoodMenuSettingsSection } from "@/pages/admin/settings/FoodMenuSettingsSection";
import { PaymentMethodsSettingsSection } from "@/pages/admin/settings/PaymentMethodsSettingsSection";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";
import { cn } from "@/lib/utils";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";

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
  const { data, isPending, isError, refetch } = useFacilitySettings();
  const { mutateAsync: patchSettings, isPending: isSaving } =
    usePatchFacilitySettings();
  const settings = data ?? fallbackFacilitySettings();
  const plans = plansFromSettings(settings);
  const openPlaySlots = openPlaySlotsFromSettings(settings);
  const preSignup = settings.preSignup;

  const [tab, setTab] = useState<SettingsTab>("prices");
  const [priceDraft, setPriceDraft] = useState<PriceDraft | null>(null);
  const [slotsDraft, setSlotsDraft] = useState<TimeSlot[] | null>(null);
  const [pricesSaved, setPricesSaved] = useState(false);
  const [slotsSaved, setSlotsSaved] = useState(false);
  const [formError, setFormError] = useState("");

  const displayPrices = priceDraft ?? pricesFromPlans(plans);
  const displaySlots = slotsDraft ?? openPlaySlots.map((slot) => ({ ...slot }));

  async function onSavePrices(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setPricesSaved(false);
    try {
      await patchSettings({
        planPrices: {
          court: Math.max(1, Number(displayPrices.court) || 1),
          openPlay: Math.max(1, Number(displayPrices["open-play"]) || 1),
        },
      });
      setPriceDraft(null);
      setPricesSaved(true);
    } catch (error) {
      setFormError(getUserFacingApiErrorMessage(error));
    }
  }

  async function onSaveSlots(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setSlotsSaved(false);
    const next = [...displaySlots]
      .map((slot) => slotFromOpenPlayHour(slot.hour, slot.durationHours ?? 2))
      .sort((a, b) => a.hour - b.hour);
    if (next.length === 0) {
      setFormError("Add at least one Open Play session.");
      return;
    }
    try {
      await patchSettings({
        openPlaySessions: next.map((slot) => ({
          slotId: slot.id,
          hour: slot.hour,
          durationHours: slot.durationHours ?? 2,
        })),
      });
      setSlotsDraft(null);
      setSlotsSaved(true);
    } catch (error) {
      setFormError(getUserFacingApiErrorMessage(error));
    }
  }

  async function onTogglePreSignup() {
    setFormError("");
    try {
      await patchSettings({ preSignup: !preSignup });
    } catch (error) {
      setFormError(getUserFacingApiErrorMessage(error));
    }
  }

  async function onResetDefaults() {
    setFormError("");
    const defaults = fallbackFacilitySettings();
    try {
      await patchSettings({
        planPrices: defaults.planPrices,
        openPlaySessions: defaults.openPlaySessions,
        paymentMethods: defaults.paymentMethods.map((m) => ({
          id: m.id,
          label: m.label,
          name: m.name,
          number: m.number,
          qrImageKey: m.qrImageKey,
        })),
        preSignup: false,
      });
      setPricesSaved(false);
      setSlotsSaved(false);
      setPriceDraft(null);
      setSlotsDraft(null);
    } catch (error) {
      setFormError(getUserFacingApiErrorMessage(error));
    }
  }

  function addSlot() {
    setSlotsSaved(false);
    setSlotsDraft((prev) => {
      const current = prev ?? openPlaySlots.map((slot) => ({ ...slot }));
      const used = new Set(current.map((slot) => slot.hour));
      const hour = START_HOURS.find((value) => !used.has(value)) ?? 7;
      return [...current, slotFromOpenPlayHour(hour)].sort(
        (a, b) => a.hour - b.hour,
      );
    });
  }

  if (isPending && !data) {
    return (
      <AppPageShell width="wide">
        <PortalListSkeleton rows={4} />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell width="wide">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-[36px] text-zinc-900 sm:text-[44px]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Plan prices, Open Play sessions, payment display, and food menu.
          </p>
          {isError ? (
            <p className="mt-2 text-sm text-maroon" role="alert">
              Could not load settings.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => void refetch()}
              >
                Retry
              </button>
              . Showing defaults until the API responds.
            </p>
          ) : null}
          {formError ? (
            <p className="mt-2 text-sm text-maroon" role="alert">
              {formError}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void onResetDefaults()}
          className="shrink-0"
          disabled={isSaving}
        >
          Reset defaults
        </Button>
      </header>

      <div
        role="tablist"
        aria-label="Settings sections"
        className="mb-4 flex flex-wrap gap-1.5 border-b border-zinc-200"
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
              "px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition",
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
                  unused for CTAs and kept for settings parity.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preSignup}
                aria-label="Pre-signup mode"
                onClick={() => void onTogglePreSignup()}
                disabled={isSaving}
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
              onSubmit={(event) => void onSavePrices(event)}
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
                        min={1}
                        step={1}
                        value={displayPrices[plan]}
                        onChange={(event) => {
                          setPricesSaved(false);
                          setPriceDraft({
                            ...displayPrices,
                            [plan]: Number(event.target.value) || 0,
                          });
                        }}
                        className="h-9 w-28 border border-zinc-200 bg-white pl-7 pr-3 text-sm text-zinc-900 outline-none focus:border-yellow"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <Button type="submit" className="w-fit" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
                {pricesSaved ? (
                  <p className="text-xs text-zinc-500" role="status">
                    Saved.
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
            facility-wide. Saved sessions apply to all devices.
          </p>
          <form
            className="mt-3 flex flex-col gap-2.5"
            onSubmit={(event) => void onSaveSlots(event)}
          >
            <ul className="flex flex-col gap-2">
              {displaySlots.map((slot, index) => (
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
                        setSlotsDraft(
                          displaySlots.map((item, i) =>
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
                        setSlotsDraft(
                          displaySlots.map((item, i) =>
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
                      disabled={displaySlots.length <= 1}
                      onClick={() => {
                        setSlotsSaved(false);
                        setSlotsDraft(
                          displaySlots.filter((_, i) => i !== index),
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
                disabled={displaySlots.length >= START_HOURS.length}
              >
                Add session
              </Button>
              <Button type="submit" className="w-fit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
              {slotsSaved ? (
                <p className="text-xs text-zinc-500" role="status">
                  Saved.
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
    </AppPageShell>
  );
}
