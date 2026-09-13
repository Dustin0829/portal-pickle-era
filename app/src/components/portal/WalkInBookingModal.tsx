import { type FormEvent, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import {
  COURTS,
  PLAN_META,
  SLOTS,
  allowsMultiSlot,
  bookingTotal,
  dateKey,
  isSlotTaken,
  saveBooking,
  selectedSlotLabels,
  type BookingPlan,
  type BookingRequest,
} from "@/lib/booking/booking";
import { cn } from "@/lib/utils";

export type WalkInBookingDefaults = {
  plan?: BookingPlan;
  date?: string;
  courtId?: string;
  slotIds?: string[];
};

export function WalkInBookingModal({
  onClose,
  onCreated,
  initial,
}: {
  onClose: () => void;
  onCreated: (booking: BookingRequest) => void;
  initial?: WalkInBookingDefaults;
}) {
  const slotsLocked = (initial?.slotIds?.length ?? 0) > 0;
  const [plan, setPlan] = useState<BookingPlan>(initial?.plan ?? "court");
  const [date, setDate] = useState(() => initial?.date ?? dateKey(new Date()));
  const [courtId, setCourtId] = useState(
    initial?.courtId ?? COURTS[0]?.id ?? "",
  );
  const [slotIds, setSlotIds] = useState<string[]>(
    () => initial?.slotIds ?? [],
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referenceId, setReferenceId] = useState("WALK-IN");
  const [error, setError] = useState("");

  const slots = SLOTS[plan];
  const multiSlot = allowsMultiSlot(plan);
  const hours = Math.max(slotIds.length, 1);
  const total = bookingTotal(plan, plan === "court" ? hours : 1);
  const canSubmit =
    name.trim().length > 0 && courtId.length > 0 && slotIds.length > 0;
  const timeSummary = selectedSlotLabels(plan, slotIds).join(", ");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      onClose();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  function selectPlan(next: BookingPlan) {
    setPlan(next);
    if (!slotsLocked) setSlotIds([]);
  }

  function selectCourt(next: string) {
    setCourtId(next);
    if (!slotsLocked) setSlotIds([]);
  }

  function toggleSlot(id: string) {
    setSlotIds((current) => {
      if (!multiSlot) return current[0] === id ? [] : [id];
      if (current.includes(id)) return current.filter((slot) => slot !== id);
      return [...current, id];
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!canSubmit) {
      setError("Name, court, and time are required.");
      return;
    }

    const booking = saveBooking({
      plan,
      date,
      courtId,
      slotId: slotIds[0],
      slotIds,
      name: name.trim(),
      email: email.trim().toLowerCase() || "walk-in@pickleera.local",
      referenceId: referenceId.trim() || "WALK-IN",
      receiptName: "Walk-in / cash",
      status: "approved",
    });
    onCreated(booking);
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close walk-in booking"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="walk-in-booking-title"
        onSubmit={onSubmit}
        className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-zinc-200/80 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-5">
          <div>
            <h2
              id="walk-in-booking-title"
              className="text-lg font-semibold text-zinc-900"
            >
              Walk-in booking
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Creates an approved booking for cash / on-site guests.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-maroon/40 text-maroon transition hover:bg-maroon/10"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Guest name
            </span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-yellow"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Email{" "}
              <span className="normal-case tracking-normal">(optional)</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="walk-in@pickleera.local"
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-yellow"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Reference
            </span>
            <input
              value={referenceId}
              onChange={(event) => setReferenceId(event.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Type
            </span>
            <select
              value={plan}
              onChange={(event) =>
                selectPlan(event.target.value as BookingPlan)
              }
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            >
              {(Object.keys(PLAN_META) as BookingPlan[]).map((key) => (
                <option key={key} value={key}>
                  {PLAN_META[key].title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                if (!slotsLocked) setSlotIds([]);
              }}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            />
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Court
            </span>
            <select
              value={courtId}
              onChange={(event) => selectCourt(event.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            >
              {COURTS.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} · {court.group}
                </option>
              ))}
            </select>
          </label>

          {slotsLocked ? (
            <div className="sm:col-span-2 rounded-xl border border-yellow/50 bg-yellow/15 px-3.5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700">
                Time selected
              </p>
              <p className="mt-1.5 text-base font-semibold leading-snug text-zinc-900">
                {timeSummary || "Selected on calendar"}
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                Total due on site:{" "}
                <span className="font-bold text-zinc-900">₱{total}</span>
                <span className="text-zinc-400"> · </span>
                Saved as approved
              </p>
            </div>
          ) : (
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Time {multiSlot ? "(select hours)" : ""}
              </p>
              <div className="mt-2 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                {slots.map((slot) => {
                  const taken = isSlotTaken(plan, date, courtId, slot.id);
                  const selected = slotIds.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={taken}
                      onClick={() => toggleSlot(slot.id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition",
                        selected
                          ? "border-yellow bg-yellow text-black"
                          : taken
                            ? "cursor-not-allowed border-zinc-100 text-zinc-300"
                            : "border-zinc-200 text-zinc-700 hover:border-yellow/60",
                      )}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {slotsLocked ? null : (
            <p className="text-xs text-zinc-500 sm:col-span-2">
              Total due on site:{" "}
              <span className="font-semibold text-yellow">₱{total}</span>
              {" · "}
              Saved as approved
            </p>
          )}

          {error ? (
            <p className="text-xs text-maroon sm:col-span-2" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-zinc-200 px-4 py-3 sm:px-5">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-yellow/90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            <Check size={14} aria-hidden />
            Create booking
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-zinc-200 px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900 sm:flex-none"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
