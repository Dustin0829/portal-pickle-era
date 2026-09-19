import { type FormEvent, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import {
  createAdminBooking,
  listOccupancy,
  listOpenPlaySessions,
} from "@/api/features/bookings/bookings.service";
import { getUserFacingApiErrorMessage } from "@/api/lib/api-error-message";
import { bookingDtoToRequest } from "@/lib/booking/mapBooking";
import {
  PLAN_META,
  bookingTotal,
  courtsShortLabel,
  dateKey,
  earliestBookableDateKey,
  parseDateKey,
  type BookablePlan,
  type BookingRequest,
} from "@/lib/booking/booking";
import { coveredHoursForOpenPlaySlotIds } from "@/lib/booking/openPlayHours";
import { useOpenPlaySlots } from "@/lib/booking/openPlaySlots";
import { usePlanUnitPrice } from "@/lib/booking/planPrices";
import {
  EMPTY_UNIFIED_SELECTION,
  toConfirmSelection,
  totalSelectedCourtHours,
  type UnifiedBookingSelection,
} from "@/lib/booking/unifiedBookingSelection";
import { UnifiedBookingSchedule } from "@/components/booking/UnifiedBookingSchedule";

export type WalkInBookingDefaults = {
  plan?: BookablePlan;
  date?: string;
  courtId?: string;
  slotIds?: string[];
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function WalkInBookingModal({
  onClose,
  onCreated,
  initial,
}: {
  onClose: () => void;
  onCreated: (booking: BookingRequest) => void;
  initial?: WalkInBookingDefaults;
}) {
  const bookableFloor = earliestBookableDateKey();
  const initialDate = initial?.date ?? dateKey(new Date());
  const [date, setDate] = useState(() =>
    initialDate >= bookableFloor ? initialDate : bookableFloor,
  );
  const [month, setMonth] = useState(() => startOfMonth(parseDateKey(date)));
  const [selection, setSelection] = useState<UnifiedBookingSelection>(() => {
    if (initial?.slotIds?.length && initial.courtId) {
      const courtId = initial.courtId as
        | "in-1"
        | "in-2"
        | "in-3"
        | "out-1"
        | "out-2"
        | "out-3";
      return {
        plan: initial.plan === "open-play" ? "open-play" : "court",
        courtId,
        slotIds: initial.slotIds,
        courtSlots:
          initial.plan === "open-play"
            ? []
            : [{ courtId, slotIds: initial.slotIds }],
      };
    }
    if (initial?.plan === "open-play") {
      return {
        plan: "open-play",
        courtId: "in-1",
        slotIds: [],
        courtSlots: [],
      };
    }
    return EMPTY_UNIFIED_SELECTION;
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referenceId, setReferenceId] = useState("WALK-IN");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [slotStatusByKey, setSlotStatusByKey] = useState<
    Map<string, "pending" | "approved">
  >(() => new Map());
  const [hoursBlockedByOpenPlay, setHoursBlockedByOpenPlay] = useState<
    Set<string>
  >(() => new Set());
  const [occupancyLoading, setOccupancyLoading] = useState(false);
  const [occupancyError, setOccupancyError] = useState("");
  const [bookedCountBySlotId, setBookedCountBySlotId] = useState<
    Map<string, number>
  >(() => new Map());
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [capacityError, setCapacityError] = useState("");

  const plan = selection.plan;
  const openPlaySlots = useOpenPlaySlots();
  const hours = totalSelectedCourtHours(selection);
  const unitPrice = usePlanUnitPrice(plan ?? "court");
  const total = plan
    ? bookingTotal(plan, plan === "court" ? hours : 1, unitPrice)
    : 0;
  const confirmed = toConfirmSelection(date, selection);
  const scheduleBlocked =
    occupancyLoading ||
    capacityLoading ||
    Boolean(occupancyError) ||
    Boolean(capacityError);
  const canSubmit =
    name.trim().length > 0 && Boolean(confirmed) && !scheduleBlocked;

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
    const controller = new AbortController();
    setOccupancyLoading(true);
    setOccupancyError("");
    void listOccupancy({ date }, controller.signal)
      .then((items) => {
        const next = new Map<string, "pending" | "approved">();
        const openPlaySlotIds: string[] = [];
        for (const item of items) {
          if (item.plan === "open-play") {
            openPlaySlotIds.push(...item.slotIds);
            continue;
          }
          for (const slotId of item.slotIds) {
            const key = `${item.courtId}|${slotId}`;
            const existing = next.get(key);
            if (existing === "approved") continue;
            next.set(key, item.status);
          }
        }
        setSlotStatusByKey(next);
        setHoursBlockedByOpenPlay(
          new Set(coveredHoursForOpenPlaySlotIds(openPlaySlotIds)),
        );
      })
      .catch(() => {
        setSlotStatusByKey(new Map());
        setHoursBlockedByOpenPlay(new Set());
        setOccupancyError(
          "Couldn’t load court availability. Check your connection and try again.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setOccupancyLoading(false);
      });
    return () => controller.abort();
  }, [date]);

  useEffect(() => {
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
  }, [date]);

  function selectDate(next: string) {
    setDate(next);
    setSelection(EMPTY_UNIFIED_SELECTION);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const payload = toConfirmSelection(date, selection);
    if (!canSubmit || !payload) {
      setError("Name and a schedule selection are required.");
      return;
    }

    setPending(true);
    try {
      const dto = await createAdminBooking({
        plan: payload.plan,
        date: payload.date,
        ...(payload.courtSlots?.length
          ? { courtSlots: payload.courtSlots }
          : {
              courtId: payload.courtId as
                | "in-1"
                | "in-2"
                | "in-3"
                | "out-1"
                | "out-2"
                | "out-3",
              slotIds: payload.slotIds,
            }),
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
        className="relative z-10 flex max-h-[min(94svh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-zinc-300 bg-[#f5f0e8] shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow">
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
            className="grid size-9 place-items-center border border-zinc-200 text-zinc-500 transition hover:border-yellow hover:text-yellow"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <UnifiedBookingSchedule
            date={date}
            month={month}
            onMonthChange={setMonth}
            onDateChange={selectDate}
            bookableFloor={bookableFloor}
            selection={selection}
            onSelectionChange={setSelection}
            prefer={initial?.plan}
            openPlaySlots={openPlaySlots}
            slotStatusByKey={slotStatusByKey}
            hoursBlockedByOpenPlay={hoursBlockedByOpenPlay}
            bookedCountBySlotId={bookedCountBySlotId}
            occupancyLoading={occupancyLoading}
            capacityLoading={capacityLoading}
            occupancyError={occupancyError}
            capacityError={capacityError}
            compact
            onBack={onClose}
          />

          <div className="space-y-4 border-t border-zinc-200 bg-white px-5 py-4">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Player name
              </span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                className="mt-1.5 h-11 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-yellow"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Email (optional)
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="player@email.com"
                className="mt-1.5 h-11 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-yellow"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Reference
              </span>
              <input
                value={referenceId}
                onChange={(event) => setReferenceId(event.target.value)}
                className="mt-1.5 h-11 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-yellow"
              />
            </label>

            <p className="border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
              {plan
                ? `Total ${PLAN_META[plan].title}${
                    plan === "court" && selection.courtSlots.length
                      ? ` · ${courtsShortLabel(selection.courtId, selection.courtSlots)}`
                      : ""
                  }: ₱${total.toLocaleString("en-PH")} · marked approved on create`
                : "Select an Open Play session or court hours."}
            </p>

            {error ? (
              <p className="text-sm text-maroon" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 border-t border-zinc-200 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 border border-zinc-200 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600 transition hover:border-yellow hover:text-yellow"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit || pending}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 bg-yellow text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-zinc-900 hover:text-yellow disabled:opacity-50"
          >
            <Check size={14} aria-hidden />
            {pending ? "Creating…" : "Create booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
