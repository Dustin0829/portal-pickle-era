import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Mail,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  useAdminBookings,
  usePatchAdminBooking,
} from "@/api/features/bookings/use-bookings";
import { getAdminBookingReceiptUrl } from "@/api/features/bookings/bookings.service";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalBackdrop } from "@/components/portal/PortalBackdrop";
import { PortalRangeSelect } from "@/components/portal/PortalRangeSelect";
import { WalkInBookingModal } from "@/components/portal/WalkInBookingModal";
import {
  PORTAL_RANGE_OPTIONS,
  type PortalRangeValue,
} from "@/components/portal/portalRange";
import {
  COURTS,
  PLAN_META,
  bookingTotal,
  dateKey,
  formatHour,
  formatLongDate,
  type BookingRequest,
  type BookingStatus,
} from "@/lib/booking/booking";
import { bookingDtoToRequest } from "@/lib/booking/mapBooking";
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
  const [recent, setRecent] = useState<RecentPreset>("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { data, refetch } = useAdminBookings({
    page: 1,
    limit: 100,
    sort: "createdAt",
    order: "desc",
  });
  const patchBooking = usePatchAdminBooking();

  const bookings = useMemo(
    () => (data?.items ?? []).map(bookingDtoToRequest),
    [data?.items],
  );

  const rangeStart = recentStart(recent);

  const pendingCount = bookings.filter((item) => {
    if (item.status !== "pending") return false;
    if (rangeStart && createdDay(item.createdAt) < rangeStart) return false;
    return true;
  }).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((item) => {
        if (filter === "pending" && item.status !== "pending") return false;
        if (rangeStart && createdDay(item.createdAt) < rangeStart) return false;
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.referenceId.toLowerCase().includes(q)
        );
      })
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [bookings, filter, query, rangeStart]);

  const selected = bookings.find((item) => item.id === detailId) ?? null;
  const recentLabel =
    PORTAL_RANGE_OPTIONS.find((item) => item.value === recent)?.label ??
    "Recent";

  function setStatus(
    id: string,
    status: Extract<BookingStatus, "approved" | "rejected">,
  ) {
    void patchBooking.mutateAsync({ id, status }).then(() => {
      void refetch();
    });
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <PortalBackdrop variant="top" />

      <AppPageShell width="full" className="relative z-10 max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
              Bookings <span className="text-amber-600">inbox</span>
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
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-amber-500"
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
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-amber-400"
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
                    ? "bg-amber-400 text-zinc-900"
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
                    ? "bg-amber-400 text-zinc-900"
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
          key={selected.id}
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
            setRecent("all");
            void refetch();
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

function AdminBookingRow({
  booking,
  onOpenDetail,
}: {
  booking: BookingRequest;
  onOpenDetail: () => void;
}) {
  const court = COURTS.find((item) => item.id === booking.courtId);
  const scheduleDate = formatLongDate(booking.date);
  const timeRange =
    booking.slotIds.length === 0
      ? "Time TBD"
      : booking.slotIds.length === 1
        ? formatSlotTime(booking.slotIds[0]!)
        : `${formatSlotTime(booking.slotIds[0]!)} – ${formatSlotTime(booking.slotIds[booking.slotIds.length - 1]!)}`;
  const courtLabel = court?.name ?? booking.courtId;

  return (
    <li className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:gap-0 lg:p-0">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:px-4 lg:py-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-green/15 text-zinc-600">
            <UserRound size={20} aria-hidden />
          </div>

          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0">
            <div className="min-w-0 lg:border-r lg:border-zinc-100 lg:px-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Email
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm text-zinc-700">
                <Mail
                  size={14}
                  className="shrink-0 text-zinc-400"
                  aria-hidden
                />
                <span className="truncate">{booking.email}</span>
              </p>
            </div>

            <div className="min-w-0 lg:border-r lg:border-zinc-100 lg:px-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Name
              </p>
              <p className="mt-1.5 truncate text-sm font-medium text-zinc-800">
                {booking.name}
              </p>
            </div>

            <div className="min-w-0 sm:col-span-2 lg:col-span-1 lg:border-r lg:border-zinc-100 lg:px-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Schedule
              </p>
              <div className="mt-1.5 flex items-start gap-1.5">
                <CalendarDays
                  size={14}
                  className="mt-0.5 shrink-0 text-zinc-400"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    {scheduleDate}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {timeRange}
                    {courtLabel ? ` · ${courtLabel}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-100 pt-3 lg:border-t-0 lg:px-4 lg:py-4 lg:pl-5">
          <StatusBadge status={booking.status} />
          <button
            type="button"
            onClick={onOpenDetail}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-600 transition hover:bg-amber-100 hover:text-zinc-900"
            aria-label="View booking details"
          >
            <Eye size={18} />
          </button>
        </div>
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
  const timeRange =
    booking.slotIds.length === 0
      ? "Time TBD"
      : booking.slotIds.length === 1
        ? formatSlotTime(booking.slotIds[0]!)
        : `${formatSlotTime(booking.slotIds[0]!)} – ${formatSlotTime(booking.slotIds[booking.slotIds.length - 1]!)}`;
  const [signedReceiptUrl, setSignedReceiptUrl] = useState<
    string | undefined
  >();
  const [receiptLoadFailed, setReceiptLoadFailed] = useState(false);
  const [didRefetch, setDidRefetch] = useState(false);
  const receiptUrl = booking.receiptKey
    ? signedReceiptUrl
    : booking.receiptDataUrl;

  useEffect(() => {
    if (!booking.receiptKey) return;
    const controller = new AbortController();
    void getAdminBookingReceiptUrl(booking.id, controller.signal)
      .then((result) => {
        setSignedReceiptUrl(result.url);
        setReceiptLoadFailed(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          error.name === "CanceledError"
        ) {
          return;
        }
        setSignedReceiptUrl(undefined);
        setReceiptLoadFailed(true);
      });
    return () => controller.abort();
  }, [booking.id, booking.receiptKey]);

  function refetchReceiptOnce() {
    if (!booking.receiptKey || didRefetch) return;
    setDidRefetch(true);
    void getAdminBookingReceiptUrl(booking.id)
      .then((result) => {
        setSignedReceiptUrl(result.url);
        setReceiptLoadFailed(false);
      })
      .catch(() => {
        setReceiptLoadFailed(true);
      });
  }

  const isImage =
    !!receiptUrl &&
    (booking.receiptMimeType?.startsWith("image/") ||
      receiptUrl.startsWith("data:image/"));
  const isPdf =
    !!receiptUrl &&
    (booking.receiptMimeType === "application/pdf" ||
      receiptUrl.startsWith("data:application/pdf"));
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
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-zinc-200/80 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2
              id="admin-booking-detail-title"
              className="text-xl font-semibold text-zinc-900"
            >
              Booking details
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <p className="font-mono text-xs text-zinc-500">
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
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-maroon/35 text-maroon transition hover:bg-maroon/10"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 md:border-b-0 md:border-r sm:p-5">
              <InfoCard
                title="Customer information"
                icon={<UserRound size={16} aria-hidden />}
              >
                <InfoRow label="Name" value={booking.name} />
                <InfoRow label="Email" value={booking.email} />
                <InfoRow label="Phone" value="—" />
              </InfoCard>

              <InfoCard
                title="Booking information"
                icon={<CalendarDays size={16} aria-hidden />}
              >
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
                  value={`${timeRange} · ${hours} ${hours === 1 ? "hour" : "hours"}`}
                />
              </InfoCard>

              <InfoCard
                title="Payment information"
                icon={<CreditCard size={16} aria-hidden />}
              >
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

            <div className="flex min-h-0 flex-col p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                Payment receipt
              </h3>
              <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 sm:min-h-[360px]">
                {isImage ? (
                  <img
                    src={receiptUrl}
                    alt={booking.receiptName || "Payment receipt"}
                    className="h-full max-h-[420px] w-full object-contain object-center"
                    onError={() => {
                      setReceiptLoadFailed(true);
                      refetchReceiptOnce();
                    }}
                  />
                ) : isPdf ? (
                  <iframe
                    title={booking.receiptName || "Payment receipt"}
                    src={receiptUrl}
                    className="h-full min-h-[360px] w-full border-0 bg-white"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
                    <span className="grid size-12 place-items-center rounded-xl bg-amber-100 text-amber-800">
                      <FileText size={22} aria-hidden />
                    </span>
                    <p className="max-w-xs text-sm font-medium text-zinc-800">
                      {booking.receiptKey
                        ? receiptLoadFailed
                          ? "Could not load receipt"
                          : "Loading receipt…"
                        : booking.receiptName || "No receipt attached"}
                    </p>
                    <p className="max-w-xs text-[11px] leading-relaxed text-zinc-500">
                      {booking.receiptKey
                        ? receiptLoadFailed
                          ? "Storage may be unset or the signed URL expired."
                          : "Fetching a short-lived preview link…"
                        : booking.receiptName
                          ? "Only the filename was saved for this request."
                          : "No payment proof was attached."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {booking.status === "pending" ? (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-zinc-200 px-4 py-3.5 sm:px-5">
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-amber-500 sm:flex-none sm:min-w-[140px]"
            >
              <Check size={15} aria-hidden />
              Approve
            </button>
            <button
              type="button"
              onClick={onReject}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-800 transition hover:border-maroon/40 hover:text-maroon sm:flex-none sm:min-w-[120px]"
            >
              <X size={15} aria-hidden />
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
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200/90 bg-white px-3.5 py-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-800">
          {icon}
        </span>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-800">
          {title}
        </h3>
      </div>
      <dl className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-2.5">
        {children}
      </dl>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <dt className="shrink-0 text-zinc-500">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-zinc-900">
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
        status === "pending" && "bg-amber-100 text-amber-900",
        status === "approved" && "bg-green/15 text-green",
        status === "rejected" && "bg-maroon/10 text-maroon",
      )}
    >
      {status === "pending" ? <Clock3 size={12} aria-hidden /> : null}
      {status}
    </span>
  );
}
