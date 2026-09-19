import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  cryptoRandomId,
  readQrImageAsDataUrl,
  resolvePaymentMethods,
  type FacilityPaymentMethod,
} from "@/lib/booking/paymentMethods";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";

export function PaymentMethodsSettingsSection() {
  const paymentMethods = useFacilitySettingsStore((s) => s.paymentMethods);
  const payment = useFacilitySettingsStore((s) => s.payment);
  const setPaymentMethods = useFacilitySettingsStore(
    (s) => s.setPaymentMethods,
  );
  const [draft, setDraft] = useState<FacilityPaymentMethod[]>(() =>
    resolvePaymentMethods({ paymentMethods, payment }).map((m) => ({ ...m })),
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function onSave(event: FormEvent) {
    event.preventDefault();
    const cleaned = draft
      .map((m) => ({
        ...m,
        label: m.label.trim(),
        name: m.name.trim(),
        number: m.number.trim(),
      }))
      .filter((m) => m.label && m.name && m.number);
    if (cleaned.length === 0) {
      setError("Add at least one payment method.");
      return;
    }
    setError("");
    setPaymentMethods(cleaned);
    setDraft(cleaned.map((m) => ({ ...m })));
    setSaved(true);
  }

  function addMethod() {
    setSaved(false);
    setDraft((prev) => [
      ...prev,
      {
        id: cryptoRandomId(),
        label: "",
        name: "",
        number: "",
        qrImageDataUrl: null,
      },
    ]);
  }

  function updateMethod(id: string, patch: Partial<FacilityPaymentMethod>) {
    setSaved(false);
    setDraft((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeMethod(id: string) {
    setSaved(false);
    setDraft((prev) => prev.filter((m) => m.id !== id));
  }

  async function onQrChange(id: string, file: File | null) {
    setSaved(false);
    setError("");
    if (!file) {
      updateMethod(id, { qrImageDataUrl: null });
      return;
    }
    try {
      const dataUrl = await readQrImageAsDataUrl(file);
      updateMethod(id, { qrImageDataUrl: dataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read QR image.");
    }
  }

  return (
    <section
      role="tabpanel"
      aria-labelledby="settings-tab-payment"
      className="border border-zinc-200 bg-white p-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
            Payment methods
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Channels shown in booking pay and wallet top-up (Previous / Next).
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addMethod}>
          Add method
        </Button>
      </div>

      <form className="mt-4 flex flex-col gap-4" onSubmit={onSave}>
        {draft.map((method, index) => (
          <div
            key={method.id}
            className="border border-zinc-200 bg-zinc-50 p-3 sm:p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                Method {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeMethod(method.id)}
                className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500 hover:text-maroon"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Bank / channel
                <input
                  value={method.label}
                  onChange={(event) =>
                    updateMethod(method.id, { label: event.target.value })
                  }
                  placeholder="GCash, Maya, BDO…"
                  className="h-9 border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Account name
                <input
                  value={method.name}
                  onChange={(event) =>
                    updateMethod(method.id, { name: event.target.value })
                  }
                  className="h-9 border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2">
                Account number
                <input
                  value={method.number}
                  onChange={(event) =>
                    updateMethod(method.id, { number: event.target.value })
                  }
                  className="h-9 border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2">
                QR image (optional)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    void onQrChange(method.id, event.target.files?.[0] ?? null)
                  }
                  className="text-sm text-zinc-700 file:mr-3 file:border-0 file:bg-yellow file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.12em]"
                />
              </label>
              {method.qrImageDataUrl ? (
                <div className="sm:col-span-2">
                  <img
                    src={method.qrImageDataUrl}
                    alt={`${method.label || "Payment"} QR preview`}
                    className="h-28 w-28 border border-zinc-200 bg-white object-contain p-1"
                  />
                  <button
                    type="button"
                    className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500 hover:text-zinc-900"
                    onClick={() =>
                      updateMethod(method.id, { qrImageDataUrl: null })
                    }
                  >
                    Clear QR
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {error ? (
          <p className="text-sm text-maroon" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" className="w-fit">
            Save payment methods
          </Button>
          {saved ? (
            <p className="text-xs text-zinc-500" role="status">
              Saved locally.
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
