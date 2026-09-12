import { type FormEvent, useState } from "react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { Button } from "@/components/ui/button";
import type { BookingPlan } from "@/lib/booking/booking";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";

const PLAN_ORDER: BookingPlan[] = ["court", "open-play", "clinic"];

export function AdminSettingsPage() {
  const { plans, payment, setPlanPrice, setPayment, resetDefaults } =
    useFacilitySettingsStore();
  const [paymentDraft, setPaymentDraft] = useState(payment);
  const [saved, setSaved] = useState(false);

  function onSavePayment(event: FormEvent) {
    event.preventDefault();
    setPayment(paymentDraft);
    setSaved(true);
  }

  return (
    <AppPageShell width="profile">
      <PageHeader
        title="Settings"
        description="Stub catalog and GCash display fields. Marketing pricing does not sync live yet."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetDefaults}
          >
            Reset defaults
          </Button>
        }
      />
      <PageSection>
        <h2 className="text-sm font-semibold">Plan prices</h2>
        <ul className="flex flex-col gap-3">
          {PLAN_ORDER.map((plan) => (
            <li key={plan} className="flex flex-col gap-1">
              <label className="text-sm" htmlFor={`price-${plan}`}>
                {plans[plan].title} ({plans[plan].unit})
              </label>
              <input
                id={`price-${plan}`}
                type="number"
                min={0}
                step={1}
                value={plans[plan].price}
                onChange={(event) =>
                  setPlanPrice(plan, Number(event.target.value) || 0)
                }
                className="h-9 max-w-xs rounded-md border border-border bg-background px-3 text-sm"
              />
            </li>
          ))}
        </ul>
      </PageSection>
      <PageSection bordered>
        <h2 className="text-sm font-semibold">GCash display</h2>
        <form className="flex max-w-md flex-col gap-3" onSubmit={onSavePayment}>
          <label className="flex flex-col gap-1 text-sm">
            Method
            <input
              value={paymentDraft.method}
              onChange={(event) =>
                setPaymentDraft((prev) => ({
                  ...prev,
                  method: event.target.value,
                }))
              }
              className="h-9 rounded-md border border-border bg-background px-3"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Account name
            <input
              value={paymentDraft.name}
              onChange={(event) =>
                setPaymentDraft((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className="h-9 rounded-md border border-border bg-background px-3"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Number
            <input
              value={paymentDraft.number}
              onChange={(event) =>
                setPaymentDraft((prev) => ({
                  ...prev,
                  number: event.target.value,
                }))
              }
              className="h-9 rounded-md border border-border bg-background px-3"
            />
          </label>
          <Button type="submit" className="w-fit">
            Save payment display
          </Button>
          {saved ? (
            <p className="text-xs text-muted-foreground" role="status">
              Saved locally.
            </p>
          ) : null}
        </form>
      </PageSection>
    </AppPageShell>
  );
}
