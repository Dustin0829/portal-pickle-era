import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardList,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMyBookings } from "@/api/features/bookings/use-bookings";
import { useMyFoodOrders } from "@/api/features/food/use-food";
import type { FoodOrderDto } from "@/api/features/food/food.schema";
import { AppPageShell } from "@/components/layout/AppPageShell";
import {
  PortalListSkeleton,
  PortalStatSkeleton,
} from "@/components/portal/portal-skeletons";
import { PLAN_META, type BookingRequest } from "@/lib/booking/booking";
import { bookingDtoToRequest } from "@/lib/booking/mapBooking";
import { foodOrderStatusLabel } from "@/lib/food/foodOrderStatus";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useBookingModal } from "@/providers/BookingModalProvider";
import { useMemo } from "react";

type RecentItem =
  | { kind: "booking"; at: string; booking: BookingRequest }
  | { kind: "food"; at: string; order: FoodOrderDto };

export function OverviewPage() {
  const { user } = useAuth();
  const { openBookingModal } = useBookingModal();
  const bookingsQuery = useMyBookings(Boolean(user));
  const foodQuery = useMyFoodOrders(Boolean(user));
  const bookings = useMemo(
    () => (bookingsQuery.data ?? []).map(bookingDtoToRequest),
    [bookingsQuery.data],
  );
  const pending = bookings.filter((item) => item.status === "pending").length;
  const approved = bookings.filter((item) => item.status === "approved").length;
  const firstName = user?.name.split(" ")[0] ?? "there";

  const recent = useMemo(() => {
    const items: RecentItem[] = [];
    for (const booking of bookings) {
      items.push({
        kind: "booking",
        at: booking.createdAt || `${booking.date}T00:00:00.000Z`,
        booking,
      });
    }
    for (const order of foodQuery.data ?? []) {
      items.push({ kind: "food", at: order.createdAt, order });
    }
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  }, [bookings, foodQuery.data]);

  const bookingsLoading = bookingsQuery.isPending && !bookingsQuery.data;
  const foodLoading = foodQuery.isPending && !foodQuery.data;
  const loading = bookingsLoading && foodLoading;
  const bookingsFailed = bookingsQuery.isError && !bookingsQuery.data;
  const foodFailed = foodQuery.isError && !foodQuery.data;
  const bothFailed = bookingsFailed && foodFailed;

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppPageShell width="full" className="relative z-10 max-w-5xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
              Hi, <span className="text-yellow">{firstName}</span>
            </h1>
            <p className="max-w-md text-sm text-zinc-500">
              Track your court requests and see what’s coming up.
            </p>
          </div>
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
        </header>

        {bookingsLoading ? (
          <PortalStatSkeleton className="mt-8" />
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatCard
              to="/app/bookings"
              label="Total requests"
              value={String(bookings.length)}
              icon={<ClipboardList size={18} />}
              iconClass="bg-green/15 text-green"
            />
            <StatCard
              to="/app/bookings"
              label="Pending"
              value={String(pending)}
              icon={<Clock3 size={18} />}
              iconClass="bg-yellow/20 text-yellow"
            />
            <StatCard
              to="/app/bookings"
              label="Approved"
              value={String(approved)}
              icon={<CheckCircle2 size={18} />}
              iconClass="bg-green/15 text-green"
            />
          </div>
        )}

        <section className="mt-10 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-900">
              Recent activity
            </h2>
            <Link
              to="/app/bookings"
              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-yellow"
            >
              View all
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>

          {loading ? (
            <PortalListSkeleton rows={3} />
          ) : bothFailed ? (
            <div
              className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500"
              role="alert"
            >
              Could not load recent activity.
            </div>
          ) : recent.length === 0 ? (
            <EmptyOverview
              onBook={() =>
                openBookingModal("court", undefined, { allowCreditsPay: true })
              }
            />
          ) : (
            <>
              {bookingsFailed || foodFailed ? (
                <p className="text-xs text-zinc-500" role="status">
                  {bookingsFailed
                    ? "Bookings could not be loaded."
                    : "Food orders could not be loaded."}{" "}
                  Showing what is available.
                </p>
              ) : null}
              <ul className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
                {recent.map((item) =>
                  item.kind === "booking" ? (
                    <RecentRequestRow
                      key={`booking-${item.booking.id}`}
                      booking={item.booking}
                    />
                  ) : (
                    <RecentFoodRow
                      key={`food-${item.order.id}`}
                      order={item.order}
                    />
                  ),
                )}
              </ul>
            </>
          )}
        </section>
      </AppPageShell>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
  to,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-4 py-4 transition hover:border-yellow/40"
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          iconClass,
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </span>
        <span className="mt-1 block text-2xl font-semibold tracking-tight text-zinc-900">
          {value}
        </span>
      </span>
      <ChevronRight
        size={18}
        className="shrink-0 text-zinc-300 transition group-hover:text-yellow"
        aria-hidden
      />
    </Link>
  );
}

function RecentRequestRow({ booking }: { booking: BookingRequest }) {
  const date = new Date(`${booking.date}T12:00:00`);
  const month = date
    .toLocaleDateString(undefined, { month: "short" })
    .toUpperCase();
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());
  const title = PLAN_META[booking.plan]?.title ?? "Court booking";
  const pending = booking.status === "pending";

  return (
    <li className="flex items-stretch gap-0 border-b border-zinc-100 last:border-b-0">
      <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center border-r border-zinc-200 bg-zinc-50 px-2 py-4 text-center sm:w-20">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900">
          {month}
        </span>
        <span className="text-xl font-semibold text-zinc-900">{day}</span>
        <span className="text-[10px] font-medium text-zinc-400">{year}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                pending
                  ? "border-yellow bg-yellow text-black shadow-yellow/40"
                  : booking.status === "approved"
                    ? "border-green/40 bg-green/10 text-green"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500",
              )}
            >
              {pending ? <Clock3 size={12} aria-hidden /> : null}
              {booking.status}
            </span>
            <span className="text-xs text-zinc-500">
              {booking.plan} · {booking.status}
            </span>
          </div>
        </div>
        <Link
          to="/app/bookings"
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-yellow"
        >
          View
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </li>
  );
}

function RecentFoodRow({ order }: { order: FoodOrderDto }) {
  const date = new Date(order.createdAt);
  const month = date
    .toLocaleDateString(undefined, { month: "short" })
    .toUpperCase();
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());
  const status = foodOrderStatusLabel(order.status);
  const summary = order.lines
    .map((line) => `${line.quantity}× ${line.name}`)
    .slice(0, 2)
    .join(", ");

  return (
    <li className="flex items-stretch gap-0 border-b border-zinc-100 last:border-b-0">
      <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center border-r border-zinc-200 bg-zinc-50 px-2 py-4 text-center sm:w-20">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900">
          {month}
        </span>
        <span className="text-xl font-semibold text-zinc-900">{day}</span>
        <span className="text-[10px] font-medium text-zinc-400">{year}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">
            Food order
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                order.status === "ready"
                  ? "border-green/40 bg-green/10 text-green"
                  : order.status === "preparing"
                    ? "border-yellow bg-yellow text-black"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500",
              )}
            >
              <UtensilsCrossed size={12} aria-hidden />
              {status}
            </span>
            <span className="truncate text-xs text-zinc-500">{summary}</span>
          </div>
        </div>
        <Link
          to="/app/food"
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-yellow"
        >
          View
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </li>
  );
}

function EmptyOverview({ onBook }: { onBook: () => void }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8">
      <p className="text-sm text-zinc-500">
        No recent bookings or food orders yet. Book a court or order from the
        café.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBook}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-yellow px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-yellow/90"
        >
          Start a booking
          <ArrowRight size={14} aria-hidden />
        </button>
        <Link
          to="/app/food"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-700 transition hover:border-yellow"
        >
          Order food
        </Link>
      </div>
    </div>
  );
}
