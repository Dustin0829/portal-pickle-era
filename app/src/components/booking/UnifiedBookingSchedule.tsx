import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  COURTS,
  OPEN_PLAY_CAPACITY,
  dateKey,
  formatHour,
  formatLongDate,
  isSlotPast,
  parseDateKey,
  SLOTS,
  type BookablePlan,
  type TimeSlot,
} from "@/lib/booking/booking";
import { resolveCourtHourPresentation } from "@/lib/booking/courtSlotPresentation";
import { expandOpenPlaySessionToHourIds } from "@/lib/booking/openPlayHours";
import {
  applyCourtHourToggle,
  applyOpenPlaySelect,
  type UnifiedBookingSelection,
} from "@/lib/booking/unifiedBookingSelection";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const DAY_HOURS = SLOTS.court;
const STRIP_LEN = 10;
type CourtGroup = "Indoor" | "Outdoor";

export type UnifiedBookingScheduleProps = {
  date: string;
  month: Date;
  onMonthChange: (month: Date) => void;
  onDateChange: (date: string) => void;
  bookableFloor: string;
  selection: UnifiedBookingSelection;
  onSelectionChange: (next: UnifiedBookingSelection) => void;
  prefer?: BookablePlan;
  openPlaySlots: TimeSlot[];
  slotStatusByKey: Map<string, "pending" | "approved">;
  /** Kept for callers; reserved-for-OP lock is no longer applied. */
  hoursBlockedByOpenPlay: Set<string>;
  bookedCountBySlotId: Map<string, number>;
  occupancyLoading: boolean;
  capacityLoading: boolean;
  occupancyError: string;
  capacityError: string;
  /** Compact chrome when embedded in a smaller admin dialog. */
  compact?: boolean;
  /** Back control — closes parent modal. */
  onBack?: () => void;
};

export function UnifiedBookingSchedule({
  date,
  month,
  onMonthChange,
  onDateChange,
  bookableFloor,
  selection,
  onSelectionChange,
  prefer: _prefer,
  openPlaySlots,
  slotStatusByKey,
  hoursBlockedByOpenPlay: _hoursBlockedByOpenPlay,
  bookedCountBySlotId,
  occupancyLoading,
  capacityLoading,
  occupancyError,
  capacityError,
  compact = false,
  onBack,
}: UnifiedBookingScheduleProps) {
  void month;
  void _prefer;
  void _hoursBlockedByOpenPlay;
  const [courtGroup, setCourtGroup] = useState<CourtGroup>("Indoor");

  const visibleCourts = useMemo(
    () => COURTS.filter((court) => court.group === courtGroup),
    [courtGroup],
  );

  const stripDates = useMemo(
    () => buildDateStrip(date, bookableFloor, STRIP_LEN),
    [date, bookableFloor],
  );

  /** Session start hour id → session (continuation hours omitted from render). */
  const sessionByStartHourId = useMemo(() => {
    const map = new Map<string, TimeSlot>();
    for (const slot of openPlaySlots) {
      const startId = `${String(slot.hour).padStart(2, "0")}:00`;
      if (!map.has(startId)) map.set(startId, slot);
    }
    return map;
  }, [openPlaySlots]);

  const continuationHourIds = useMemo(() => {
    const set = new Set<string>();
    for (const slot of openPlaySlots) {
      const covered = expandOpenPlaySessionToHourIds({
        hour: slot.hour,
        durationHours: slot.durationHours,
      });
      for (const hourId of covered.slice(1)) set.add(hourId);
    }
    return set;
  }, [openPlaySlots]);

  const scheduleLoading = occupancyLoading || capacityLoading;
  const loadError = occupancyError || capacityError;
  const gridBlocked = Boolean(loadError) || scheduleLoading;

  function slotHold(
    courtId: string,
    slotId: string,
  ): "pending" | "approved" | null {
    return slotStatusByKey.get(`${courtId}|${slotId}`) ?? null;
  }

  function selectDate(next: string) {
    if (next < bookableFloor) return;
    onDateChange(next);
    onMonthChange(startOfMonth(parseDateKey(next)));
  }

  function shiftStrip(delta: number) {
    const anchor = parseDateKey(stripDates[0] ?? date);
    const next = addDays(anchor, delta);
    const key = dateKey(next);
    if (key < bookableFloor && delta < 0) {
      selectDate(bookableFloor);
      return;
    }
    selectDate(key < bookableFloor ? bookableFloor : key);
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col bg-[#f5f0e8] text-zinc-900",
        compact ? "gap-3" : "gap-0",
      )}
    >
      <header className="flex items-center gap-3 bg-yellow px-4 py-3 text-black sm:px-5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-black/20 text-black transition hover:border-black hover:bg-black/5"
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <span className="size-9 shrink-0" />
        )}
        <div className="mx-auto flex min-w-0 flex-col items-center rounded-full bg-white px-5 py-2 text-zinc-900">
          <p className="truncate text-sm font-bold">{formatLongDate(date)}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Select Date & Time
          </p>
        </div>
        <span className="size-9 shrink-0" />
      </header>

      <div className="flex items-center gap-1 border-b border-zinc-200 bg-white px-2 py-2 sm:px-3">
        <button
          type="button"
          aria-label="Previous dates"
          onClick={() => shiftStrip(-STRIP_LEN)}
          className="grid size-8 shrink-0 place-items-center text-zinc-500 hover:text-zinc-900"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {stripDates.map((key) => {
            const d = parseDateKey(key);
            const selected = key === date;
            const disabled = key < bookableFloor;
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => selectDate(key)}
                className={cn(
                  "flex min-w-[4.25rem] shrink-0 flex-col items-center rounded-md px-2 py-2 text-center transition",
                  selected
                    ? "bg-yellow text-black"
                    : "text-zinc-600 hover:bg-zinc-100",
                  disabled && "opacity-30",
                )}
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.08em]">
                  {d.toLocaleDateString("en-PH", { weekday: "short" })}
                </span>
                <span className="text-base font-bold tabular-nums leading-none">
                  {d.getDate()}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.06em]">
                  {d.toLocaleDateString("en-PH", { month: "short" })}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Next dates"
          onClick={() => shiftStrip(STRIP_LEN)}
          className="grid size-8 shrink-0 place-items-center text-zinc-500 hover:text-zinc-900"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        className={cn(
          "grid min-h-0 flex-1",
          compact
            ? "grid-cols-1"
            : "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)]",
        )}
      >
        <div className="min-h-0 overflow-y-auto px-3 py-3 sm:px-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500"
              role={loadError ? "alert" : undefined}
            >
              {loadError ? loadError : "Courts · times"}
            </p>
            <div
              role="group"
              aria-label="Court group"
              className="flex border border-zinc-200 bg-white"
            >
              {(["Indoor", "Outdoor"] as const).map((group) => (
                <button
                  key={group}
                  type="button"
                  aria-pressed={courtGroup === group}
                  onClick={() => {
                    if (courtGroup !== group) {
                      setCourtGroup(group);
                      if (selection.plan === "court") {
                        onSelectionChange({
                          plan: null,
                          courtId: "",
                          slotIds: [],
                          courtSlots: [],
                        });
                      }
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition",
                    courtGroup === group
                      ? "bg-yellow text-black"
                      : "text-zinc-500 hover:text-zinc-900",
                  )}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {scheduleLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-zinc-200 bg-white">
              <div
                className="grid min-w-[320px]"
                style={{
                  gridTemplateColumns: `5.5rem repeat(${visibleCourts.length}, minmax(4.5rem, 1fr))`,
                }}
                role="grid"
                aria-label={`${courtGroup} court day grid`}
              >
                <div className="border-b border-zinc-200 px-2 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">
                  Times
                </div>
                {visibleCourts.map((court) => (
                  <div
                    key={court.id}
                    className="border-b border-l border-zinc-200 px-1 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-600"
                  >
                    CRT {court.name.replace(/Court\s+/i, "")}
                  </div>
                ))}

                {DAY_HOURS.map((hour) => {
                  if (continuationHourIds.has(hour.id)) return null;
                  const openPlaySession =
                    sessionByStartHourId.get(hour.id) ?? null;
                  if (openPlaySession) {
                    return (
                      <OpenPlayBand
                        key={`op-${openPlaySession.id}`}
                        session={openPlaySession}
                        courtCount={visibleCourts.length}
                        date={date}
                        selection={selection}
                        gridBlocked={gridBlocked}
                        bookedCountBySlotId={bookedCountBySlotId}
                        onOpenPlaySelect={(sessionId) => {
                          onSelectionChange(
                            applyOpenPlaySelect(selection, sessionId),
                          );
                        }}
                      />
                    );
                  }
                  return (
                    <HourRow
                      key={hour.id}
                      hour={hour}
                      courts={visibleCourts}
                      date={date}
                      selection={selection}
                      gridBlocked={gridBlocked}
                      slotHold={slotHold}
                      onCourtToggle={(courtId, hourId) => {
                        onSelectionChange(
                          applyCourtHourToggle(selection, courtId, hourId),
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!compact ? (
          <div className="hidden border-l border-zinc-200 bg-[#efe8dc] p-4 lg:block">
            <img
              src="/image.png"
              alt="Pickle Era court map: indoor courts 1 to 3, outdoor courts 4 to 6"
              className="h-full max-h-[28rem] w-full object-contain object-center"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function isCourtHourSelected(
  selection: UnifiedBookingSelection,
  courtId: string,
  hourId: string,
): boolean {
  if (selection.plan !== "court") return false;
  if (selection.courtSlots.length > 0) {
    return selection.courtSlots.some(
      (segment) =>
        segment.courtId === courtId && segment.slotIds.includes(hourId),
    );
  }
  return selection.courtId === courtId && selection.slotIds.includes(hourId);
}

function OpenPlayBand({
  session,
  courtCount,
  date,
  selection,
  gridBlocked,
  bookedCountBySlotId,
  onOpenPlaySelect,
}: {
  session: TimeSlot;
  courtCount: number;
  date: string;
  selection: UnifiedBookingSelection;
  gridBlocked: boolean;
  bookedCountBySlotId: Map<string, number>;
  onOpenPlaySelect: (sessionId: string) => void;
}) {
  const duration = Math.max(session.durationHours ?? 2, 1);
  const booked = bookedCountBySlotId.get(session.id) ?? 0;
  const sessionPast = isSlotPast(date, session.hour);
  const sessionFull = booked >= OPEN_PLAY_CAPACITY;
  const openPlaySelected =
    selection.plan === "open-play" && selection.slotIds[0] === session.id;
  const openSlot = !sessionPast && !sessionFull && !gridBlocked;
  const startLabel = formatHour(session.hour).replace(":00 ", "");
  const endLabel = formatHour(session.hour + duration).replace(":00 ", "");
  const label = sessionPast
    ? "Past"
    : sessionFull
      ? `Full - ${booked}/${OPEN_PLAY_CAPACITY}`
      : `Open Play - ${booked}/${OPEN_PLAY_CAPACITY}`;

  return (
    <>
      <div
        className="flex items-center gap-1 border-b border-zinc-100 px-2 py-2 text-[10px] font-semibold text-zinc-600"
        style={{ gridRow: `span ${duration}` }}
      >
        <span aria-hidden>☀</span>
        <span>
          {startLabel}–{endLabel}
        </span>
      </div>
      <button
        type="button"
        disabled={!openSlot}
        aria-label={label}
        onClick={() => onOpenPlaySelect(session.id)}
        title={label}
        style={{
          gridRow: `span ${duration}`,
          gridColumn: `span ${courtCount}`,
        }}
        className={cn(
          "border-b border-l border-zinc-100 px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.04em] transition",
          openPlaySelected
            ? "bg-yellow text-black"
            : openSlot
              ? "bg-zinc-50 text-zinc-500 hover:bg-yellow/40 hover:text-zinc-800"
              : "bg-zinc-100 text-zinc-400",
        )}
      >
        {label}
      </button>
    </>
  );
}

function HourRow({
  hour,
  courts,
  date,
  selection,
  gridBlocked,
  slotHold,
  onCourtToggle,
}: {
  hour: TimeSlot;
  courts: typeof COURTS;
  date: string;
  selection: UnifiedBookingSelection;
  gridBlocked: boolean;
  slotHold: (courtId: string, slotId: string) => "pending" | "approved" | null;
  onCourtToggle: (
    courtId: (typeof COURTS)[number]["id"],
    hourId: string,
  ) => void;
}) {
  const past = isSlotPast(date, hour.hour);
  const endLabel = formatHour(hour.hour + 1).replace(":00 ", "");
  const startLabel = formatHour(hour.hour).replace(":00 ", "");

  return (
    <>
      <div className="flex items-center gap-1 border-b border-zinc-100 px-2 py-2 text-[10px] font-semibold text-zinc-600">
        <span aria-hidden>☀</span>
        <span>
          {startLabel}–{endLabel}
        </span>
      </div>
      {courts.map((court) => {
        const hold = slotHold(court.id, hour.id);
        const presentation = resolveCourtHourPresentation({
          hold,
          openPlayHold: false,
          past,
          hasCourt: true,
        });
        const selectable = presentation.selectable && !gridBlocked;
        const selected = isCourtHourSelected(selection, court.id, hour.id);

        let label = "Available";
        if (past) label = "Past";
        else if (presentation.pending) label = "Pending";
        else if (presentation.approved) label = "Taken";
        else if (selected) label = "Selected";

        return (
          <button
            key={`${court.id}-${hour.id}`}
            type="button"
            disabled={!selectable}
            aria-label={`${court.name} ${hour.label}`}
            onClick={() => onCourtToggle(court.id, hour.id)}
            title={label}
            className={cn(
              "border-b border-l border-zinc-100 px-1 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.04em] transition",
              selected
                ? "bg-yellow text-black"
                : past || !selectable
                  ? "bg-zinc-100 text-zinc-400"
                  : "bg-white text-zinc-500 hover:bg-yellow/30 hover:text-zinc-800",
            )}
          >
            {label}
          </button>
        );
      })}
    </>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, count: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function buildDateStrip(selected: string, floor: string, length: number) {
  const selectedDate = parseDateKey(selected);
  const floorDate = parseDateKey(floor);
  let start = addDays(selectedDate, -Math.floor(length / 3));
  if (start < floorDate) start = floorDate;
  const keys: string[] = [];
  for (let i = 0; i < length; i += 1) {
    keys.push(dateKey(addDays(start, i)));
  }
  return keys;
}
