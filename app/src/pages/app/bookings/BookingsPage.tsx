import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  X,
} from "lucide-react";
import { useMyBookings } from "@/api/features/bookings/use-bookings";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalListSkeleton } from "@/components/portal/portal-skeletons";
import {
  PLAN_META,
  bookingCourtHours,
  bookingTotal,
  courtsShortLabel,
  formatHour,
  formatLongDate,
  type BookingRequest,
} from "@/lib/booking/booking";
import { readPlanUnitPrice } from "@/lib/booking/planPrices";
import { bookingDtoToRequest } from "@/lib/booking/mapBooking";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useBookingModal } from "@/providers/BookingModalProvider";

type BookingFilter = "all" | "pending" | "approved" | "completed" | "cancelled";

const PAGE_SIZE = 4;

const FILTERS: { id: BookingFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayBucket(booking: BookingRequest): Exclude<BookingFilter, "all"> {
  if (booking.status === "pending") return "pending";
  if (booking.status === "rejected") return "cancelled";
  if (booking.date < todayIso()) return "completed";
  return "approved";
}

function formatSlotTime(slotId: string) {
  const hour = Number(slotId.slice(0, 2));
  if (Number.isNaN(hour)) return slotId;
  return formatHour(hour);
}

function bookingHours(booking: BookingRequest) {
  return bookingCourtHours(booking);
}

function bookingTimeRange(booking: BookingRequest) {
  if (booking.slotIds.length === 0) return "Time TBD";
  if (booking.plan !== "court") {
    return booking.slotIds.map(formatSlotTime).join(", ");
  }
  const hours = booking.slotIds
    .map((id) => Number(id.slice(0, 2)))
    .filter((hour) => !Number.isNaN(hour))
    .sort((a, b) => a - b);
  if (hours.length === 0) return booking.slotIds.join(", ");
  const start = hours[0];
  const end = hours[hours.length - 1] + 1;
  return `${formatHour(start)} – ${formatHour(end)}`;
}

function BookingFilterSelect({
  value,
  onChange,
}: {
  value: BookingFilter;
  onChange: (value: BookingFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = FILTERS.find((item) => item.id === value) ?? FILTERS[0]!;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Filter bookings"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 min-w-[9.5rem] items-center justify-between gap-3 rounded-full border border-zinc-200/80 bg-white px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-800 transition hover:border-zinc-300"
      >
        <span>{selected.label}</span>
        <ChevronDown
          size={15}
          className={cn(
            "shrink-0 text-zinc-500 transition",
            open && "rotate-180 text-zinc-800",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Filter bookings"
          className="absolute right-0 z-30 mt-2 min-w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white py-1.5 shadow-lg"
        >
          {FILTERS.map((option) => {
            const active = option.id === value;
            return (
              <li key={option.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.14em] transition",
                    active
                      ? "bg-yellow/70 text-black"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function BookingsPage() {
  const { user } = useAuth();
  const { openBookingModal } = useBookingModal();
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isPending, isError } = useMyBookings(Boolean(user));
  const bookings = useMemo(() => {
    const list = (data ?? []).map(bookingDtoToRequest);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [data]);
  const listPending = isPending && !data;

  const visible =
    filter === "all"
      ? bookings
      : bookings.filter((item) => displayBucket(item) === filter);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const selected = bookings.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppPageShell width="full" className="relative z-10 max-w-5xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
              My <span className="text-yellow">bookings</span>
            </h1>
            <p className="max-w-lg text-sm text-zinc-500">
              Requests tied to your account email. Guest bookings show up when
              the email matches.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BookingFilterSelect
              value={filter}
              onChange={(next) => {
                setFilter(next);
                setPage(1);
              }}
            />
            <button
              type="button"
              onClick={() =>
                openBookingModal("court", undefined, { allowCreditsPay: true })
              }
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-yellow/90"
            >
              <CalendarDays size={16} aria-hidden />
              Book a court
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </header>

        <section className="mt-8 flex flex-col gap-3">
          {listPending ? (
            <PortalListSkeleton rows={4} />
          ) : isError && !data ? (
            <div
              className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500"
              role="alert"
            >
              Could not load your bookings.
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8">
              <p className="text-sm text-zinc-500">
                {bookings.length === 0
                  ? `No bookings for ${user?.email ?? "this account"} yet.`
                  : `No ${filter === "all" ? "" : `${filter} `}bookings in this filter.`}
              </p>
              {bookings.length === 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    openBookingModal("court", undefined, {
                      allowCreditsPay: true,
                    })
                  }
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-yellow/90"
                >
                  Book a court
                  <ArrowRight size={14} aria-hidden />
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {pageItems.map((item) => (
                  <BookingCard
                    key={item.id}
                    booking={item}
                    onOpen={() => setSelectedId(item.id)}
                  />
                ))}
              </ul>

              {visible.length > PAGE_SIZE ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 px-1 py-1">
                  <p className="text-xs text-zinc-500">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, visible.length)} of{" "}
                    {visible.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous page"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-9 items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-700 transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={14} aria-hidden />
                      Prev
                    </button>
                    <p className="min-w-[4.5rem] text-center text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                      {currentPage} / {pageCount}
                    </p>
                    <button
                      type="button"
                      aria-label="Next page"
                      disabled={currentPage >= pageCount}
                      onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                      className="inline-flex h-9 items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-700 transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={14} aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </AppPageShell>

      {selected ? (
        <BookingDetailSheet
          booking={selected}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}

function BookingCard({
  booking,
  onOpen,
}: {
  booking: BookingRequest;
  onOpen: () => void;
}) {
  const courtName = courtsShortLabel(booking.courtId, booking.courtSlots);
  const meta = PLAN_META[booking.plan];
  const bucket = displayBucket(booking);
  const date = new Date(`${booking.date}T12:00:00`);
  const month = date
    .toLocaleDateString(undefined, { month: "short" })
    .toUpperCase();
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());
  const hours = bookingHours(booking);

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-stretch overflow-hidden rounded-2xl border border-zinc-200/80 bg-white text-left transition hover:border-yellow/40"
      >
        <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center border-r border-zinc-200 bg-zinc-50 px-2 py-5 text-center sm:w-20">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900">
            {month}
          </span>
          <span className="text-xl font-semibold text-zinc-900">{day}</span>
          <span className="text-[10px] font-medium text-zinc-400">{year}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {meta.title}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} aria-hidden className="text-zinc-400" />
                {bookingTimeRange(booking)}
              </span>
              <span aria-hidden>·</span>
              <span>
                {hours} {hours === 1 ? "hour" : "hours"}
              </span>
              <span aria-hidden>·</span>
              <span>{courtName}</span>
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <FileText size={13} aria-hidden className="text-zinc-400" />
                Ref {booking.referenceId}
              </span>
              {booking.receiptName ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="truncate">{booking.receiptName}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusPill bucket={bucket} />
            <ChevronRight
              size={18}
              className="shrink-0 text-zinc-300"
              aria-hidden
            />
          </div>
        </div>
      </button>
    </li>
  );
}

function BookingDetailSheet({
  booking,
  onClose,
}: {
  booking: BookingRequest;
  onClose: () => void;
}) {
  const courtName = courtsShortLabel(booking.courtId, booking.courtSlots);
  const meta = PLAN_META[booking.plan];
  const bucket = displayBucket(booking);
  const hours = bookingHours(booking);
  const total = bookingTotal(
    booking.plan,
    hours,
    readPlanUnitPrice(booking.plan),
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close booking details"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-title"
        className="relative z-10 flex h-[min(90vh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-zinc-200/80 bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow">
              Booking details
            </p>
            <h2
              id="booking-detail-title"
              className="mt-1 text-lg font-semibold text-zinc-900"
            >
              {meta.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:border-yellow hover:text-yellow"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex min-h-0 flex-col overflow-y-auto border-b border-zinc-200 px-5 py-5 md:border-b-0 md:border-r">
            <div className="mb-5">
              <StatusPill bucket={bucket} />
            </div>

            <dl className="flex flex-col gap-4">
              <DetailRow
                icon={<CalendarDays size={16} />}
                label="Date"
                value={formatLongDate(booking.date)}
              />
              <DetailRow
                icon={<MapPin size={16} />}
                label="Court"
                value={courtName || "Court not specified"}
              />
              <DetailRow
                icon={<Clock3 size={16} />}
                label="Schedule"
                value={`${bookingTimeRange(booking)} · ${hours} ${hours === 1 ? "hour" : "hours"}`}
              />
              <DetailRow
                icon={<FileText size={16} />}
                label="Reference ID"
                value={booking.referenceId || "—"}
              />
            </dl>

            <div className="mt-auto flex items-baseline justify-between border-t border-zinc-200 pt-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Estimated total
              </span>
              <span className="display text-[28px] text-yellow">₱{total}</span>
            </div>
          </div>

          <div className="relative flex min-h-[240px] flex-col bg-zinc-50 md:min-h-0">
            <p className="absolute left-4 top-4 z-10 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
              Payment proof
            </p>
            {booking.receiptDataUrl &&
            (booking.receiptMimeType?.startsWith("image/") ||
              booking.receiptDataUrl.startsWith("data:image/")) ? (
              <img
                src={booking.receiptDataUrl}
                alt={booking.receiptName || "Payment receipt"}
                className="h-full w-full object-cover object-center"
              />
            ) : booking.receiptDataUrl &&
              (booking.receiptMimeType === "application/pdf" ||
                booking.receiptDataUrl.startsWith("data:application/pdf")) ? (
              <iframe
                title={booking.receiptName || "Payment receipt"}
                src={booking.receiptDataUrl}
                className="h-full w-full border-0 bg-white"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-yellow/15 text-yellow">
                  <FileText size={24} aria-hidden />
                </span>
                <p className="text-sm font-medium text-zinc-900">
                  {booking.receiptName || "No receipt attached"}
                </p>
                <p className="max-w-xs text-xs text-zinc-500">
                  {booking.receiptName
                    ? "This booking only saved the filename. Upload a new request with a receipt image to see a full-height preview here."
                    : "No payment proof was attached to this request."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-zinc-400">{icon}</span>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </dt>
        <dd className="mt-1 text-sm text-zinc-900">{value}</dd>
      </div>
    </div>
  );
}

function StatusPill({ bucket }: { bucket: Exclude<BookingFilter, "all"> }) {
  const label =
    bucket === "pending"
      ? "Pending"
      : bucket === "approved"
        ? "Approved"
        : bucket === "completed"
          ? "Completed"
          : "Cancelled";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
        bucket === "pending" &&
          "border-yellow bg-yellow text-black shadow-yellow/40",
        bucket === "approved" && "border-green/40 bg-green/10 text-green",
        bucket === "completed" && "border-zinc-200 bg-zinc-50 text-zinc-600",
        bucket === "cancelled" && "border-maroon/40 bg-maroon/10 text-maroon",
      )}
    >
      {bucket === "pending" ? <Clock3 size={12} aria-hidden /> : null}
      {label}
    </span>
  );
}
