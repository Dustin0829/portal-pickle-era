import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  User,
  X,
} from "lucide-react";
import {
  COURTS,
  PLAN_META,
  SLOTS,
  bookingTotal,
  formatHour,
  isSlotPast,
  type BookingRequest,
  type BookingStatus,
} from "@/lib/booking/booking";
import { cn } from "@/lib/utils";

type BookSlotInput = {
  date: string;
  courtId: string;
  slotIds: string[];
};

type CourtCalendarProps = {
  date: string;
  onDateChange: (date: string) => void;
  bookings: BookingRequest[];
  /** When true, schedule is informational only (no booking from slots). */
  readOnly?: boolean;
  /** Player pay vs admin walk-in copy. Used when `onBookSlot` is set. */
  bookIntent?: "pay" | "walk-in";
  /** Keep the day schedule open after confirming selected hours. */
  keepOpenOnBook?: boolean;
  /** Player: confirm selected open hours to start payment for that court. */
  onBookSlot?: (input: BookSlotInput) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_SLOTS = SLOTS.court;

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function parseIsoDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(iso: string) {
  return parseIsoDate(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(iso: string, delta: number) {
  const date = parseIsoDate(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + delta);
  const maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, maxDay));
  return toIsoDate(date);
}

function activeBookings(bookings: BookingRequest[]) {
  return bookings.filter((item) => item.status !== "rejected");
}

function bookingsForDate(bookings: BookingRequest[], iso: string) {
  return activeBookings(bookings)
    .filter((item) => item.date === iso)
    .sort((a, b) => {
      const aSlot = a.slotIds[0] ?? "";
      const bSlot = b.slotIds[0] ?? "";
      return (
        aSlot.localeCompare(bSlot) || a.createdAt.localeCompare(b.createdAt)
      );
    });
}

function buildMonthCells(selectedIso: string) {
  const selected = parseIsoDate(selectedIso);
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string; day: number } | null> = [];

  for (let i = 0; i < startPad; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ iso: toIsoDate(new Date(year, month, day)), day });
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function formatSlotTime(slotId: string) {
  const hour = Number(slotId.slice(0, 2));
  if (Number.isNaN(hour)) return slotId;
  return `${formatHour(hour)} – ${formatHour(hour + 1)}`;
}

/** Month calendar — click a day to open taken / available schedule modal. */
export function CourtDayGrid({
  date,
  onDateChange,
  bookings,
  readOnly = true,
  bookIntent = "pay",
  keepOpenOnBook = false,
  onBookSlot,
}: CourtCalendarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const cells = buildMonthCells(date);
  const weekRows = Math.max(cells.length / 7, 1);
  const todayKey = toIsoDate(new Date());
  const countsByDate = new Map<string, number>();
  const canBook = Boolean(onBookSlot) && !readOnly;
  const isWalkIn = bookIntent === "walk-in";

  for (const booking of activeBookings(bookings)) {
    countsByDate.set(booking.date, (countsByDate.get(booking.date) ?? 0) + 1);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:border-yellow hover:text-yellow"
            aria-label="Previous month"
            onClick={() => onDateChange(shiftMonth(date, -1))}
          >
            <ChevronLeft size={16} />
          </button>
          <p className="display min-w-[12ch] text-center text-[20px] text-zinc-900 sm:text-[24px]">
            {monthLabel(date)}
          </p>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:border-yellow hover:text-yellow"
            aria-label="Next month"
            onClick={() => onDateChange(shiftMonth(date, 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-yellow px-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-yellow/90"
          onClick={() => {
            onDateChange(todayKey);
            setModalOpen(true);
          }}
        >
          <CalendarDays size={14} aria-hidden />
          Today
        </button>
      </div>

      <p className="shrink-0 text-xs text-zinc-500">
        {canBook
          ? isWalkIn
            ? "Click a day, select open hours, then add a walk-in."
            : "Click a day, select one or more open hours, then pay."
          : "Click a day for taken / available times"}
        {readOnly ? " · read-only" : ""}.
      </p>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
        <div className="grid shrink-0 grid-cols-7 border-b border-zinc-200">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-0.5 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400"
            >
              {day}
            </div>
          ))}
        </div>
        <div
          className="grid min-h-0 flex-1 grid-cols-7"
          style={{
            gridTemplateRows: `repeat(${weekRows}, minmax(3.25rem, 1fr))`,
          }}
        >
          {cells.map((cell, index) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-full border-t border-r border-zinc-100 bg-zinc-50/80"
                />
              );
            }
            const count = countsByDate.get(cell.iso) ?? 0;
            const selected = cell.iso === date && modalOpen;
            const isToday = cell.iso === todayKey;
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => {
                  onDateChange(cell.iso);
                  setModalOpen(true);
                }}
                className={cn(
                  "flex h-full flex-col items-start gap-1 border-t border-r border-zinc-100 px-2 py-2 text-left transition",
                  selected
                    ? "bg-yellow/15 ring-1 ring-inset ring-yellow"
                    : count > 0
                      ? "bg-yellow/25 hover:bg-yellow/35"
                      : "hover:bg-zinc-50",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold",
                    selected
                      ? "bg-yellow text-black"
                      : isToday
                        ? "bg-green text-white"
                        : "text-zinc-900",
                  )}
                >
                  {cell.day}
                </span>
                <span
                  className={cn(
                    "mt-auto text-[10px] leading-tight",
                    count > 0 ? "font-semibold text-zinc-800" : "text-zinc-400",
                  )}
                >
                  {count > 0
                    ? `${count} booking${count === 1 ? "" : "s"}`
                    : "Open"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {modalOpen ? (
        <DayScheduleModal
          date={date}
          bookings={bookings}
          readOnly={readOnly}
          canBook={canBook}
          bookIntent={bookIntent}
          onBookSlot={
            onBookSlot
              ? (input) => {
                  if (!keepOpenOnBook) setModalOpen(false);
                  onBookSlot(input);
                }
              : undefined
          }
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

function DayScheduleModal({
  date,
  bookings,
  readOnly,
  canBook,
  bookIntent,
  onBookSlot,
  onClose,
}: {
  date: string;
  bookings: BookingRequest[];
  readOnly: boolean;
  canBook: boolean;
  bookIntent: "pay" | "walk-in";
  onBookSlot?: (input: BookSlotInput) => void;
  onClose: () => void;
}) {
  const dayBookings = useMemo(
    () => bookingsForDate(bookings, date),
    [bookings, date],
  );

  const slotHoldByKey = useMemo(() => {
    const keys = new Map<string, "pending" | "approved">();
    for (const booking of dayBookings) {
      const slots =
        booking.slotIds?.length > 0
          ? booking.slotIds
          : booking.slotId
            ? [booking.slotId]
            : [];
      for (const slotId of slots) {
        const key = `${booking.courtId}|${slotId}`;
        const existing = keys.get(key);
        if (existing === "approved") continue;
        if (booking.status === "approved" || booking.status === "pending") {
          keys.set(key, booking.status);
        }
      }
    }
    return keys;
  }, [dayBookings]);

  const courts = useMemo(() => {
    return COURTS.map((court) => {
      const slots = DAY_SLOTS.map((slot) => {
        const hold = slotHoldByKey.get(`${court.id}|${slot.id}`) ?? null;
        const past = isSlotPast(date, slot.hour);
        return {
          slotId: slot.id,
          label: `${formatHour(slot.hour)} – ${formatHour(slot.hour + 1)}`,
          hold,
          past,
          hour: slot.hour,
          open: hold === null && !past,
        };
      });
      return {
        courtId: court.id,
        name: court.name,
        shortName: court.name.replace(/^Court\s+/i, "C"),
        group: court.group,
        slots,
        openSlots: slots.filter((slot) => slot.open),
        visibleSlots: slots.filter((slot) => !slot.past),
        availableCount: slots.filter((slot) => slot.open).length,
      };
    });
  }, [date, slotHoldByKey]);

  const availableCount = courts.reduce(
    (total, court) => total + court.availableCount,
    0,
  );

  const [activeCourtId, setActiveCourtId] = useState(
    () => courts[0]?.courtId ?? COURTS[0]!.id,
  );
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  useEffect(() => {
    const stillValid = courts.some((court) => court.courtId === activeCourtId);
    if (!stillValid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset selection when court list changes
      setActiveCourtId(courts[0]?.courtId ?? COURTS[0]!.id);
      setSelectedSlotIds([]);
    }
  }, [activeCourtId, courts]);

  const activeCourt =
    courts.find((court) => court.courtId === activeCourtId) ?? courts[0];

  const isWalkIn = bookIntent === "walk-in";
  const selectedSorted = useMemo(() => {
    const open = new Set(activeCourt?.openSlots.map((slot) => slot.slotId));
    return [...selectedSlotIds]
      .filter((id) => open.has(id))
      .sort((a, b) => a.localeCompare(b));
  }, [activeCourt, selectedSlotIds]);
  const payTotal = bookingTotal("court", selectedSorted.length);

  function selectCourt(courtId: string) {
    setActiveCourtId(courtId);
    setSelectedSlotIds([]);
  }

  function toggleSlot(slotId: string) {
    setSelectedSlotIds((current) =>
      current.includes(slotId)
        ? current.filter((id) => id !== slotId)
        : [...current, slotId],
    );
  }

  const scheduleLabel = parseIsoDate(date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close day schedule"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-schedule-title"
        className="relative z-10 flex max-h-[90svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-zinc-200/80 bg-white shadow-2xl sm:rounded-3xl"
        data-lenis-prevent
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-amber-100">
              <CalendarDays size={18} className="text-zinc-900" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Day schedule
                {readOnly && !canBook ? " · read-only" : ""}
              </p>
              <h2
                id="day-schedule-title"
                className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl"
              >
                {scheduleLabel}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {dayBookings.length} taken · {availableCount} available court
                hours
                {canBook
                  ? isWalkIn
                    ? " · tap open hours"
                    : " · tap open hours to multi-select"
                  : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-800"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 lg:overflow-hidden">
          <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-8">
            <section className="shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 sm:p-5 lg:min-h-0 lg:overflow-hidden">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-green">
                  Open hours
                </h3>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                  {canBook
                    ? isWalkIn
                      ? "Tap to select · then book walk-in"
                      : "Tap to select · booked hours on the right"
                    : "Open only"}
                </p>
              </div>

              <div
                className="grid grid-cols-3 gap-2 sm:grid-cols-6"
                role="tablist"
                aria-label="Courts"
              >
                {courts.map((court) => {
                  const selected = court.courtId === activeCourt?.courtId;
                  return (
                    <button
                      key={court.courtId}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => selectCourt(court.courtId)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 transition",
                        selected
                          ? "border-amber-400 bg-amber-400 text-zinc-900"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900",
                      )}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em]">
                        {court.shortName}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 text-[11px] font-semibold",
                          selected ? "text-zinc-900/70" : "text-zinc-400",
                        )}
                      >
                        {court.availableCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeCourt ? (
                <div role="tabpanel" className="mt-4">
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-900">
                      {activeCourt.name}
                      <span className="font-normal text-zinc-400">
                        {" "}
                        · {activeCourt.group}
                      </span>
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green">
                      {selectedSorted.length > 0
                        ? `${selectedSorted.length} selected`
                        : `${activeCourt.availableCount} open`}
                    </p>
                  </div>
                  {activeCourt.visibleSlots.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-6 text-sm text-zinc-500">
                      No hours left on this court today.
                    </p>
                  ) : (
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {activeCourt.visibleSlots.map((slot) => {
                        const bookable =
                          canBook && Boolean(onBookSlot) && slot.open;
                        const picked = selectedSorted.includes(slot.slotId);
                        const pending = slot.hold === "pending";
                        const approved = slot.hold === "approved";

                        if (bookable) {
                          return (
                            <li key={slot.slotId}>
                              <button
                                type="button"
                                aria-pressed={picked}
                                onClick={() => toggleSlot(slot.slotId)}
                                className={cn(
                                  "flex w-full flex-col items-center justify-center rounded-xl border-2 px-3 py-3 text-center text-[12px] font-bold tracking-tight transition",
                                  picked
                                    ? "border-amber-400 bg-amber-400 text-zinc-900"
                                    : "border-green/40 bg-green text-white shadow-green/25 hover:brightness-110",
                                )}
                              >
                                {slot.label}
                              </button>
                            </li>
                          );
                        }

                        return (
                          <li
                            key={slot.slotId}
                            className={cn(
                              "flex flex-col items-center justify-center rounded-xl border-2 px-3 py-3 text-center text-[12px] font-bold tracking-tight",
                              pending &&
                                "border-amber-300/80 bg-amber-50 text-amber-900",
                              approved &&
                                "border-zinc-200 bg-zinc-100 text-zinc-400",
                              !pending &&
                                !approved &&
                                "border-green/40 bg-green text-white shadow-green/25",
                            )}
                          >
                            <span
                              className={approved ? "line-through" : undefined}
                            >
                              {slot.label}
                            </span>
                            {pending ? (
                              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-700">
                                Pending
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : null}
            </section>

            <section className="flex min-h-0 flex-col lg:h-full">
              <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-maroon">
                  Booked
                </h3>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  {dayBookings.length} booking
                  {dayBookings.length === 1 ? "" : "s"}
                </p>
              </div>
              {dayBookings.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-sm text-zinc-500">
                  No bookings for this day.
                </p>
              ) : (
                <ul className="flex min-h-0 flex-col gap-3 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                  {dayBookings.map((booking) => (
                    <DayBookingRow key={booking.id} booking={booking} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3.5 sm:px-6">
          {canBook && onBookSlot && selectedSorted.length > 0 ? (
            <>
              <p className="text-xs text-zinc-500">
                {activeCourt?.name ?? "Court"} · {selectedSorted.length} hour
                {selectedSorted.length === 1 ? "" : "s"} · ₱{payTotal}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlotIds([])}
                  className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600 transition hover:border-zinc-300"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onBookSlot({
                      date,
                      courtId: activeCourt?.courtId ?? activeCourtId,
                      slotIds: selectedSorted,
                    })
                  }
                  className="inline-flex h-10 items-center rounded-xl bg-amber-400 px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-amber-500"
                >
                  {isWalkIn
                    ? `Book walk-in · ₱${payTotal}`
                    : `Continue to pay · ₱${payTotal}`}
                </button>
              </div>
            </>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <Info size={13} className="shrink-0" aria-hidden />
              All times are in Philippine Standard Time (PHT).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DayBookingRow({ booking }: { booking: BookingRequest }) {
  const court = COURTS.find((item) => item.id === booking.courtId);
  const time =
    booking.slotIds.length > 0
      ? booking.slotIds.map(formatSlotTime).join(", ")
      : "Time TBD";
  const planTitle = PLAN_META[booking.plan]?.title ?? booking.plan;

  return (
    <li className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
      <div className="absolute inset-y-0 left-0 w-1 bg-maroon" aria-hidden />
      <div className="pl-1">
        <div className="flex items-center gap-3 px-3.5 py-3.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-maroon text-white">
            <Clock3 size={14} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900">{time}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {court?.name ?? "Court"}
            </p>
          </div>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-300"
            aria-hidden
          >
            <ChevronRight size={18} />
          </span>
        </div>

        <div className="border-t border-zinc-100" />

        <div className="flex items-center gap-3 px-3.5 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500">
            <User size={14} aria-hidden />
          </span>
          <p className="min-w-0 flex-1 truncate text-sm text-zinc-800">
            {planTitle}
            {booking.name ? ` · ${booking.name}` : ""}
          </p>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
              booking.status === "pending" && "bg-amber-100 text-amber-900",
              booking.status === "approved" && "bg-green/15 text-green",
              booking.status === "rejected" && "bg-maroon/10 text-maroon",
            )}
          >
            {booking.status === "pending" ? (
              <Clock3 size={11} aria-hidden />
            ) : null}
            {STATUS_LABEL[booking.status]}
          </span>
        </div>
      </div>
    </li>
  );
}
