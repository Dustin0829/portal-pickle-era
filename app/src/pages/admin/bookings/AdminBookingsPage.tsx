import { type FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Eye,
  ExternalLink,
  FileText,
  Mail,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalBackdrop } from "@/components/portal/PortalBackdrop";
import { PortalRangeSelect } from "@/components/portal/PortalRangeSelect";
import {
  PORTAL_RANGE_OPTIONS,
  type PortalRangeValue,
} from "@/components/portal/portalRange";
import {
  COURTS,
  PLAN_META,
  SLOTS,
  allowsMultiSlot,
  bookingTotal,
  dateKey,
  ensureBookingFixtures,
  formatHour,
  formatLongDate,
  isSlotTaken,
  listBookings,
  saveBooking,
  updateBookingStatus,
  type BookingPlan,
  type BookingRequest,
  type BookingStatus,
} from "@/lib/booking/booking";
import { cn } from "@/lib/utils";

type RecentPreset = PortalRangeValue;

function recentStart(preset: RecentPreset): string | null {
  const now = new Date();
  if (preset === "all") return null;
  if (preset === "today") return dateKey(now);
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  return dateKey(start);
}

function createdDay(iso: string) {
  return iso.slice(0, 10);
}

function formatSlotTime(slotId: string) {
  const hour = Number(slotId.slice(0, 2));
  if (Number.isNaN(hour)) return slotId;
  return formatHour(hour);
}

export function AdminBookingsPage() {
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentPreset>("today");
  const [tick, setTick] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const bookings = useMemo(() => {
    ensureBookingFixtures();
    void tick;
    return listBookings().sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [tick]);

  const rangeStart = recentStart(recent);

  const pendingCount = bookings.filter((item) => {
    if (item.status !== "pending") return false;
    if (rangeStart && createdDay(item.createdAt) < rangeStart) return false;
    return true;
  }).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((item) => {
      if (filter === "pending" && item.status !== "pending") return false;
      if (rangeStart && createdDay(item.createdAt) < rangeStart) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.referenceId.toLowerCase().includes(q)
      );
    });
  }, [bookings, filter, query, rangeStart]);

  const selected = bookings.find((item) => item.id === detailId) ?? null;
  const recentLabel =
    PORTAL_RANGE_OPTIONS.find((item) => item.value === recent)?.label ??
    "Recent";

  function setStatus(id: string, status: BookingStatus) {
    updateBookingStatus(id, status);
    setTick((value) => value + 1);
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <PortalBackdrop variant="top" />

      <AppPageShell width="full" className="relative z-10 max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
              Bookings <span className="text-yellow">inbox</span>
            </h1>
            <p className="text-sm text-zinc-500">
              Review GCash requests or add walk-in bookings on the spot.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PortalRangeSelect
              value={recent}
              onChange={setRecent}
              label="Recent bookings"
            />
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-yellow/90"
            >
              <Plus size={15} aria-hidden />
              Walk-in booking
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-3">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search bookings</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email, or reference number…"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-yellow"
              />
            </label>

            <div
              className="inline-flex gap-1 rounded-2xl border border-zinc-200/80 bg-white p-1.5 shadow-sm"
              role="tablist"
              aria-label="Booking status"
            >
              <button
                type="button"
                role="tab"
                aria-selected={filter === "pending"}
                onClick={() => setFilter("pending")}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition",
                  filter === "pending"
                    ? "bg-yellow text-black"
                    : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === "all"}
                onClick={() => setFilter("all")}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition",
                  filter === "all"
                    ? "bg-yellow text-black"
                    : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                All
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
          Recent · {recentLabel}
        </p>

        <section className="mt-5 flex flex-col gap-3">
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500 shadow-sm">
              {filter === "pending"
                ? "No pending booking requests."
                : "No booking requests yet."}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((item) => (
                <AdminBookingRow
                  key={item.id}
                  booking={item}
                  onOpenDetail={() => setDetailId(item.id)}
                />
              ))}
            </ul>
          )}
        </section>

        <p className="mt-4 text-xs text-zinc-400">
          Showing {visible.length} of {bookings.length} booking
          {bookings.length === 1 ? "" : "s"}.
        </p>
      </AppPageShell>

      {selected ? (
        <AdminBookingDetailSheet
          booking={selected}
          onClose={() => setDetailId(null)}
          onApprove={() => {
            setStatus(selected.id, "approved");
            setDetailId(null);
          }}
          onReject={() => {
            setStatus(selected.id, "rejected");
            setDetailId(null);
          }}
        />
      ) : null}

      {createOpen ? (
        <WalkInBookingModal
          onClose={() => setCreateOpen(false)}
          onCreated={(booking) => {
            setCreateOpen(false);
            setFilter("all");
            setRecent("today");
            setTick((value) => value + 1);
            setDetailId(booking.id);
          }}
        />
      ) : null}
    </div>
  );
}

function bookingHours(booking: BookingRequest) {
  if (booking.plan === "court") return Math.max(booking.slotIds.length, 1);
  return 1;
}

function WalkInBookingModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (booking: BookingRequest) => void;
}) {
  const [plan, setPlan] = useState<BookingPlan>("court");
  const [date, setDate] = useState(() => dateKey(new Date()));
  const [courtId, setCourtId] = useState(COURTS[0]?.id ?? "");
  const [slotIds, setSlotIds] = useState<string[]>([]);
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

  function selectPlan(next: BookingPlan) {
    setPlan(next);
    setSlotIds([]);
  }

  function selectCourt(next: string) {
    setCourtId(next);
    setSlotIds([]);
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
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
                setSlotIds([]);
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

          <p className="text-xs text-zinc-500 sm:col-span-2">
            Total due on site:{" "}
            <span className="font-semibold text-yellow">₱{total}</span>
            {" · "}
            Saved as approved
          </p>

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

function AdminBookingRow({
  booking,
  onOpenDetail,
}: {
  booking: BookingRequest;
  onOpenDetail: () => void;
}) {
  const court = COURTS.find((item) => item.id === booking.courtId);
  const meta = PLAN_META[booking.plan];
  const timeLabel =
    booking.slotIds.length > 0
      ? booking.slotIds.map(formatSlotTime).join(", ")
      : "Time TBD";

  return (
    <li className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="grid size-11 shrink-0 place-items-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500">
          <UserRound size={20} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {booking.name} · {meta.title}
            </p>
            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Email
              </p>
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-zinc-600">
                <Mail
                  size={12}
                  className="shrink-0 text-zinc-400"
                  aria-hidden
                />
                <span className="truncate">{booking.email}</span>
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Schedule
              </p>
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-zinc-600">
                <CalendarDays
                  size={12}
                  className="shrink-0 text-zinc-400"
                  aria-hidden
                />
                <span className="truncate">
                  {booking.date}
                  {court ? ` · ${court.name}` : ""}
                  {` · ${timeLabel}`}
                </span>
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Reference
              </p>
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-zinc-600">
                <FileText
                  size={12}
                  className="shrink-0 text-zinc-400"
                  aria-hidden
                />
                <span className="truncate">
                  {booking.referenceId}
                  {booking.receiptName ? ` · ${booking.receiptName}` : ""}
                </span>
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDetail}
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:border-yellow hover:text-yellow"
          aria-label="View booking details"
        >
          <Eye size={18} />
        </button>
      </div>
    </li>
  );
}

function AdminBookingDetailSheet({
  booking,
  onClose,
  onApprove,
  onReject,
}: {
  booking: BookingRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const court = COURTS.find((item) => item.id === booking.courtId);
  const meta = PLAN_META[booking.plan];
  const hours = bookingHours(booking);
  const total = bookingTotal(booking.plan, hours);
  const timeLabel =
    booking.slotIds.length > 0
      ? booking.slotIds.map(formatSlotTime).join(", ")
      : "Time TBD";
  const isImage =
    !!booking.receiptDataUrl &&
    (booking.receiptMimeType?.startsWith("image/") ||
      booking.receiptDataUrl.startsWith("data:image/"));
  const isPdf =
    !!booking.receiptDataUrl &&
    (booking.receiptMimeType === "application/pdf" ||
      booking.receiptDataUrl.startsWith("data:application/pdf"));
  const submittedAt = new Date(booking.createdAt).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close booking details"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-booking-detail-title"
        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-zinc-200/80 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2
              id="admin-booking-detail-title"
              className="text-lg font-semibold text-zinc-900"
            >
              Booking details
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="font-mono text-xs text-zinc-600">
                <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  ID
                </span>
                {booking.id.slice(0, 18).toUpperCase()}
              </p>
              <StatusBadge status={booking.status} />
            </div>
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

        <div className="grid md:grid-cols-2">
          <div className="flex flex-col gap-2.5 border-b border-zinc-200 p-4 md:border-b-0 md:border-r sm:p-5">
            <InfoCard title="Customer information">
              <InfoRow label="Name" value={booking.name} />
              <InfoRow label="Email" value={booking.email} />
              <InfoRow label="Phone" value="—" />
            </InfoCard>

            <InfoCard title="Booking information">
              <InfoRow label="Type" value={meta.title} />
              <InfoRow
                label="Court"
                value={
                  court ? `${court.name} · ${court.group}` : "Not specified"
                }
              />
              <InfoRow label="Date" value={formatLongDate(booking.date)} />
              <InfoRow
                label="Schedule"
                value={`${timeLabel} · ${hours} ${hours === 1 ? "hour" : "hours"}`}
              />
            </InfoCard>

            <InfoCard title="Payment information">
              <InfoRow label="Amount" value={`₱${total}`} />
              <InfoRow label="Payment channel" value="GCash" />
              <InfoRow
                label="Reference ID"
                value={booking.referenceId || "—"}
              />
              <InfoRow label="Proof submitted" value={submittedAt} />
              <InfoRow
                label="Receipt file"
                value={booking.receiptName || "None"}
              />
            </InfoCard>
          </div>

          <div className="flex flex-col p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Payment receipt
              </h3>
              {booking.receiptDataUrl ? (
                <a
                  href={booking.receiptDataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-maroon hover:text-yellow"
                >
                  Open full size
                  <ExternalLink size={11} aria-hidden />
                </a>
              ) : null}
            </div>
            <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 sm:h-[260px]">
              {isImage ? (
                <img
                  src={booking.receiptDataUrl}
                  alt={booking.receiptName || "Payment receipt"}
                  className="h-full w-full object-contain object-center p-2"
                />
              ) : isPdf ? (
                <iframe
                  title={booking.receiptName || "Payment receipt"}
                  src={booking.receiptDataUrl}
                  className="h-full w-full border-0 bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 px-5 text-center">
                  <span className="grid size-11 place-items-center rounded-xl bg-yellow/15 text-yellow">
                    <FileText size={20} aria-hidden />
                  </span>
                  <p className="text-sm font-medium text-zinc-900">
                    {booking.receiptName || "No receipt attached"}
                  </p>
                  <p className="max-w-xs text-[11px] text-zinc-500">
                    {booking.receiptName
                      ? "Only the filename was saved for this request."
                      : "No payment proof was attached."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {booking.status === "pending" ? (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-zinc-200 px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-yellow/90 sm:flex-none"
            >
              <Check size={14} aria-hidden />
              Approve
            </button>
            <button
              type="button"
              onClick={onReject}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-700 transition hover:border-maroon hover:text-maroon sm:flex-none"
            >
              <X size={14} aria-hidden />
              Reject
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2.5">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-yellow">
        {title}
      </h3>
      <dl className="mt-2 flex flex-col gap-1.5">{children}</dl>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <dt className="shrink-0 text-zinc-500">{label}</dt>
      <dd className="truncate text-right font-medium text-zinc-900">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        status === "pending" && "border-yellow/50 bg-yellow/10 text-yellow",
        status === "approved" && "border-green/40 bg-green/10 text-green",
        status === "rejected" && "border-maroon/40 bg-maroon/10 text-maroon",
      )}
    >
      {status}
    </span>
  );
}
