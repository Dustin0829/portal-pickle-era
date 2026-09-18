import { type FormEvent, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import {
  createAdminBooking,
  listOpenPlaySessions,
} from "@/api/features/bookings/bookings.service";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";
import { bookingDtoToRequest } from "@/lib/booking/mapBooking";
import {
  COURTS,
  OPEN_PLAY_CAPACITY,
  PLAN_META,
  SLOTS,
  allowsMultiSlot,
  bookingTotal,
  dateKey,
  type BookingPlan,
  type BookingRequest,
} from "@/lib/booking/booking";
import { useOpenPlaySlots } from "@/lib/booking/openPlaySlots";
import { usePlanUnitPrice } from "@/lib/booking/planPrices";
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
    initial?.courtId ??
      (initial?.plan === "open-play" ? "in-1" : (COURTS[0]?.id ?? "")),
  );
  const [slotIds, setSlotIds] = useState<string[]>(
    () => initial?.slotIds ?? [],
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referenceId, setReferenceId] = useState("WALK-IN");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [bookedCountBySlotId, setBookedCountBySlotId] = useState<
    Map<string, number>
  >(() => new Map());
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [capacityError, setCapacityError] = useState("");

  const isOpenPlay = plan === "open-play";
  const openPlaySlots = useOpenPlaySlots();
  const slots = isOpenPlay ? openPlaySlots : SLOTS[plan];
  const multiSlot = allowsMultiSlot(plan);
  const hours = Math.max(slotIds.length, 1);
  const unitPrice = usePlanUnitPrice(plan);
  const total = bookingTotal(plan, plan === "court" ? hours : 1, unitPrice);
  const canSubmit =
    name.trim().length > 0 &&
    (isOpenPlay ? true : courtId.length > 0) &&
    slotIds.length > 0 &&
    !(isOpenPlay && (capacityLoading || Boolean(capacityError)));
  const timeSummary = slots
    .filter((slot) => slotIds.includes(slot.id))
    .map((slot) => slot.label)
    .join(", ");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      onClose();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  useEffect(() => {
    if (!isOpenPlay || !date) return;
    const controller = new AbortController();
    setCapacityLoading(true);
    setCapacityError("");
    void listOpenPlaySessions({ date }, controller.signal)
      .then((items) => {
        const next = new Map<string, number>();
        for (const item of items) {
          next.set(item.slotId, item.bookedCount);
        }
        setBookedCountBySlotId(next);
      })
      .catch(() => {
        setBookedCountBySlotId(new Map());
        setCapacityError(
          "Couldn’t load session availability. Check your connection and try again.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setCapacityLoading(false);
      });
    return () => controller.abort();
  }, [isOpenPlay, date]);

  function selectPlan(next: BookingPlan) {
    setPlan(next);
    if (!slotsLocked) setSlotIds([]);
    if (next === "open-play") setCourtId("in-1");
  }

  function selectCourt(next: string) {
    setCourtId(next);
    if (!slotsLocked) setSlotIds([]);
  }

  function toggleSlot(id: string) {
    if (isOpenPlay) setCourtId("in-1");
    setSlotIds((current) => {
      if (!multiSlot) return current[0] === id ? [] : [id];
      if (current.includes(id)) return current.filter((slot) => slot !== id);
      return [...current, id];
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const resolvedCourtId = isOpenPlay ? courtId || "in-1" : courtId;
    if (!canSubmit || !resolvedCourtId) {
      setError("Name, court, and time are required.");
      return;
    }

    setPending(true);
    try {
      const dto = await createAdminBooking({
        plan,
        date,
        courtId: resolvedCourtId as
          | "in-1"
          | "in-2"
          | "in-3"
          | "out-1"
          | "out-2"
          | "out-3",
        slotIds,
        name: name.trim(),
        email: email.trim().toLowerCase() || "walk-in@pickleera.local",
        referenceId: referenceId.trim() || "WALK-IN",
        receiptName: "Walk-in / cash",
      });
      onCreated(bookingDtoToRequest(dto));
    } catch (caught) {
      setError(getUserFacingApiErrorMessage(caught));
    } finally {
      setPending(false);
    }
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
        onSubmit={(event) => void onSubmit(event)}
        className="relative z-10 flex max-h-[min(92svh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
              Facility
            </p>
            <h2
              id="walk-in-booking-title"
              className="display mt-1 text-[28px] text-zinc-900"
            >
              Walk-in booking
            </h2>
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-yellow hover:text-yellow"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PLAN_META) as BookingPlan[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => selectPlan(item)}
                className={cn(
                  "h-9 rounded-lg px-3 text-[10px] font-bold uppercase tracking-[0.14em] transition",
                  plan === item
                    ? "bg-yellow text-black"
                    : "border border-zinc-200 text-zinc-600 hover:border-yellow hover:text-yellow",
                )}
              >
                {PLAN_META[item].title}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                if (!slotsLocked) setSlotIds([]);
              }}
              className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            />
          </label>

          {!isOpenPlay ? (
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                Court
              </span>
              <select
                value={courtId}
                onChange={(event) => selectCourt(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
              >
                {COURTS.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.group} · {court.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              Time
            </p>
            {isOpenPlay && capacityError ? (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {capacityError}
              </p>
            ) : null}
            <div className="mt-1.5 flex flex-wrap gap-2">
              {slots.map((slot) => {
                const selected = slotIds.includes(slot.id);
                const booked = bookedCountBySlotId.get(slot.id) ?? 0;
                const full = isOpenPlay && booked >= OPEN_PLAY_CAPACITY;
                const disabled =
                  (slotsLocked && !selected) ||
                  (isOpenPlay &&
                    (capacityLoading || Boolean(capacityError) || full));
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleSlot(slot.id)}
                    className={cn(
                      "flex h-auto min-h-9 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] transition",
                      selected
                        ? "bg-yellow text-black"
                        : "border border-zinc-200 text-zinc-600 hover:border-yellow hover:text-yellow disabled:opacity-40",
                    )}
                  >
                    <span>{slot.label}</span>
                    {isOpenPlay ? (
                      <span
                        className={cn(
                          "text-[9px] tracking-[0.12em]",
                          selected ? "text-black/70" : "text-zinc-400",
                        )}
                      >
                        {capacityLoading
                          ? "…"
                          : `${booked}/${OPEN_PLAY_CAPACITY}${full ? " · Full" : ""}`}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {timeSummary ? (
              <p className="mt-2 text-xs text-zinc-500">{timeSummary}</p>
            ) : (
              <p className="mt-2 text-xs text-zinc-400">
                {isOpenPlay ? "Select a session." : "Select hours."}
              </p>
            )}
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              Player name
            </span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              Email (optional)
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="player@email.com"
              className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              Reference
            </span>
            <input
              value={referenceId}
              onChange={(event) => setReferenceId(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
            />
          </label>

          <p className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
            Total {PLAN_META[plan].title}: ₱{total.toLocaleString("en-PH")} ·
            marked approved on create
          </p>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex gap-2 border-t border-zinc-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-zinc-200 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600 transition hover:border-yellow hover:text-yellow"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit || pending}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-yellow text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-yellow/90 disabled:opacity-50"
          >
            <Check size={14} aria-hidden />
            {pending ? "Creating…" : "Create booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
