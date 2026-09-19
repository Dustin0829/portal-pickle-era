import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  COURTS,
  OPEN_PLAY_CAPACITY,
  OPENING_DATE,
  SLOTS,
  dateKey,
  formatHour,
  formatLongDate,
  isSlotPast,
  parseDateKey,
  type BookablePlan,
  type TimeSlot,
} from "@/lib/booking/booking";
import { resolveCourtHourPresentation } from "@/lib/booking/courtSlotPresentation";
import {
  applyCourtHourToggle,
  applyOpenPlaySelect,
  type UnifiedBookingSelection,
} from "@/lib/booking/unifiedBookingSelection";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_HOURS = SLOTS.court;
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
  hoursBlockedByOpenPlay: Set<string>;
  bookedCountBySlotId: Map<string, number>;
  occupancyLoading: boolean;
  capacityLoading: boolean;
  occupancyError: string;
  capacityError: string;
  /** Compact chrome when embedded in a smaller admin dialog. */
  compact?: boolean;
};

export function UnifiedBookingSchedule({
  date,
  month,
  onMonthChange,
  onDateChange,
  bookableFloor,
  selection,
  onSelectionChange,
  prefer,
  openPlaySlots,
  slotStatusByKey,
  hoursBlockedByOpenPlay,
  bookedCountBySlotId,
  occupancyLoading,
  capacityLoading,
  occupancyError,
  capacityError,
  compact = false,
}: UnifiedBookingScheduleProps) {
  const [courtGroup, setCourtGroup] = useState<CourtGroup>("Indoor");
  const visibleCourts = useMemo(
    () => COURTS.filter((court) => court.group === courtGroup),
    [courtGroup],
  );
  const days = useMemo(() => monthCells(month), [month]);
  const earliestMonth = startOfMonth(parseDateKey(bookableFloor));
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
    onDateChange(next);
  }

  return (
    <div
      className={cn(
        "grid min-h-0 flex-1",
        compact
          ? "gap-4 lg:grid-cols-1"
          : "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)]",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-col",
          compact
            ? "order-first"
            : "px-5 pt-6 sm:px-7 sm:pt-7 lg:border-r lg:border-white/10 lg:pr-6",
        )}
      >
        {!compact ? (
          <div className="shrink-0 pr-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow">
              {prefer === "open-play" ? "Join open play" : "Book a court"}
            </p>
            <h2
              id="booking-modal-title"
              className="display mt-2 text-[28px] text-white sm:text-[34px]"
            >
              Schedule
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Open Play sessions and private court hours for one date.
            </p>
            {dateKey(new Date()) < OPENING_DATE ? (
              <p className="mt-2 text-xs leading-relaxed text-yellow/90">
                This is advance booking for October onwards. Earliest date:{" "}
                {formatLongDate(OPENING_DATE)}.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className={cn("min-h-0 flex-1", compact ? "mt-0" : "mt-5")}>
          <img
            src="/image.png"
            alt="Pickle Era court map: indoor courts 1 to 3, outdoor courts 4 to 6"
            className={cn(
              "w-full object-contain object-center",
              compact ? "mx-auto h-28 max-w-md" : "h-36 lg:h-full",
            )}
          />
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-col",
          compact ? "" : "px-5 pb-5 pt-4 sm:px-7 sm:pb-7 lg:pt-7",
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-white">
              {month.toLocaleDateString("en-PH", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center text-white/70 transition hover:text-yellow disabled:text-white/20"
                onClick={() => onMonthChange(addMonths(month, -1))}
                disabled={month <= earliestMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center text-white/70 transition hover:text-yellow"
                onClick={() => onMonthChange(addMonths(month, 1))}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
            {days.map((day, index) => {
              if (!day) return <span key={`pad-${index}`} className="h-9" />;
              const key = dateKey(day);
              const disabled = key < bookableFloor;
              const selected = key === date;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDate(key)}
                  className={cn(
                    "grid h-9 place-items-center text-[13px] transition",
                    selected
                      ? "bg-yellow font-bold text-black"
                      : disabled
                        ? "text-white/20"
                        : "text-white hover:bg-white/10",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <p
            className={cn(
              "mt-5 text-[11px] font-bold uppercase tracking-[0.16em]",
              prefer === "open-play" ? "text-yellow" : "text-white",
            )}
          >
            Open Play · {formatLongDate(date)}
          </p>

          {scheduleLoading ? (
            <div
              className="mt-3 space-y-3"
              aria-busy="true"
              aria-label="Loading schedule"
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton
                    key={`op-sk-${index}`}
                    className="h-12 rounded-lg bg-white/10"
                  />
                ))}
              </div>
              <Skeleton className="h-48 rounded-lg bg-white/10" />
            </div>
          ) : (
            <>
              {loadError ? (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {loadError}
                </p>
              ) : null}

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {openPlaySlots.map((slot) => {
                  const booked = bookedCountBySlotId.get(slot.id) ?? 0;
                  const full = booked >= OPEN_PLAY_CAPACITY;
                  const past = isSlotPast(date, slot.hour);
                  const openSlot = !loadError && !past && !full;
                  const selected =
                    selection.plan === "open-play" &&
                    selection.slotIds.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!openSlot}
                      onClick={() =>
                        onSelectionChange(
                          applyOpenPlaySelect(selection, slot.id),
                        )
                      }
                      className={cn(
                        "flex min-h-11 flex-col items-center justify-center gap-0.5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition",
                        selected
                          ? "bg-yellow text-black"
                          : openSlot
                            ? "border border-white/20 text-white hover:border-yellow hover:text-yellow"
                            : "border border-white/10 text-white/25",
                        prefer === "open-play" && openSlot && !selected
                          ? "ring-1 ring-yellow/40"
                          : null,
                      )}
                    >
                      <span>{slot.label}</span>
                      <span
                        className={cn(
                          "text-[9px] font-bold tracking-[0.16em]",
                          selected
                            ? "text-black/70"
                            : openSlot
                              ? "text-white/55"
                              : "text-white/30",
                        )}
                      >
                        {`${booked}/${OPEN_PLAY_CAPACITY}${full ? " · Full" : ""}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                    Courts · times
                  </p>
                  <p className="mt-1 min-h-5 text-sm text-white/45">
                    {loadError
                      ? "Times unavailable until the schedule loads."
                      : selection.plan === "open-play"
                        ? "Open Play selected — picking a court hour switches to private rental."
                        : "Tap hours on one court. Multi-hour OK."}
                  </p>
                </div>
                <div
                  role="group"
                  aria-label="Court group"
                  className="flex border border-white/15"
                >
                  {(["Indoor", "Outdoor"] as const).map((group) => (
                    <button
                      key={group}
                      type="button"
                      aria-pressed={courtGroup === group}
                      onClick={() => setCourtGroup(group)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition",
                        courtGroup === group
                          ? "bg-yellow text-black"
                          : "text-white/55 hover:text-yellow",
                      )}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 -mx-1 overflow-x-auto pb-1">
                <div
                  className="min-w-[320px]"
                  role="grid"
                  aria-label={`${courtGroup} court day grid`}
                >
                  <div
                    className="grid gap-px"
                    style={{
                      gridTemplateColumns: `3.75rem repeat(${visibleCourts.length}, minmax(4.75rem, 1fr))`,
                    }}
                  >
                    <div className="sticky left-0 z-[1] bg-black" />
                    {visibleCourts.map((court) => (
                      <div
                        key={court.id}
                        className="px-1 pb-1.5 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-white/70"
                      >
                        {court.name}
                      </div>
                    ))}

                    {DAY_HOURS.map((hour) => (
                      <HourRow
                        key={hour.id}
                        hour={hour}
                        courts={visibleCourts}
                        date={date}
                        selection={selection}
                        gridBlocked={gridBlocked}
                        slotHold={slotHold}
                        hoursBlockedByOpenPlay={hoursBlockedByOpenPlay}
                        onToggle={(courtId, hourId) =>
                          onSelectionChange(
                            applyCourtHourToggle(selection, courtId, hourId),
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function HourRow({
  hour,
  courts,
  date,
  selection,
  gridBlocked,
  slotHold,
  hoursBlockedByOpenPlay,
  onToggle,
}: {
  hour: TimeSlot;
  courts: typeof COURTS;
  date: string;
  selection: UnifiedBookingSelection;
  gridBlocked: boolean;
  slotHold: (courtId: string, slotId: string) => "pending" | "approved" | null;
  hoursBlockedByOpenPlay: Set<string>;
  onToggle: (courtId: string, hourId: string) => void;
}) {
  return (
    <>
      <div className="sticky left-0 z-[1] flex items-center bg-black pr-1 text-[11px] font-semibold tabular-nums text-white/55">
        {formatHour(hour.hour).replace(":00 ", "")}
      </div>
      {courts.map((court) => {
        const hold = slotHold(court.id, hour.id);
        const past = isSlotPast(date, hour.hour);
        const openPlayHold = hoursBlockedByOpenPlay.has(hour.id);
        const presentation = resolveCourtHourPresentation({
          hold,
          openPlayHold,
          past,
          hasCourt: true,
        });
        const selectable = presentation.selectable && !gridBlocked;
        const selected =
          selection.plan === "court" &&
          selection.courtId === court.id &&
          selection.slotIds.includes(hour.id);
        const label =
          presentation.label ??
          (presentation.pending
            ? "Pending"
            : presentation.approved
              ? "Taken"
              : "Available");
        return (
          <button
            key={`${court.id}-${hour.id}`}
            type="button"
            disabled={!selectable}
            aria-label={`${court.name} ${hour.label}`}
            onClick={() => onToggle(court.id, hour.id)}
            title={label}
            className={cn(
              "flex min-h-10 items-center justify-center border border-white/10 px-1 py-1 text-[9px] font-semibold uppercase tracking-[0.04em] transition",
              selected
                ? "border-yellow bg-yellow text-black"
                : presentation.className,
            )}
          >
            <span
              className={
                presentation.approved && !presentation.reservedForOpenPlay
                  ? "line-through"
                  : undefined
              }
            >
              {label}
            </span>
          </button>
        );
      })}
    </>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function monthCells(month: Date) {
  const first = startOfMonth(month);
  const offset = first.getDay();
  const lastDate = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < offset; i += 1) cells.push(null);
  for (let day = 1; day <= lastDate; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  return cells;
}
