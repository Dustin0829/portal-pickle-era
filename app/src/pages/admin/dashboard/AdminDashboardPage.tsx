import { useMemo, useState } from "react";
import { ClipboardList, PhilippinePeso, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminBookings } from "@/api/features/bookings/use-bookings";
import { useAdminFoodOrders } from "@/api/features/food/use-food";
import { useAdminWaitlistList } from "@/api/features/waitlist/use-waitlist";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalRangeSelect } from "@/components/portal/PortalRangeSelect";
import {
  PortalListSkeleton,
  PortalStatSkeleton,
} from "@/components/portal/portal-skeletons";
import {
  PORTAL_RANGE_OPTIONS,
  type PortalRangeValue,
} from "@/components/portal/portalRange";
import {
  PLAN_META,
  bookingCourtHours,
  bookingTotal,
  dateKey,
  type BookingRequest,
} from "@/lib/booking/booking";
import { readPlanUnitPrice } from "@/lib/booking/planPrices";
import { bookingDtoToRequest } from "@/lib/booking/mapBooking";
import { foodOrderStatusLabel } from "@/lib/food/foodOrderStatus";
import { cn } from "@/lib/utils";

type RangePreset = PortalRangeValue;

type ActivityItem = {
  id: string;
  at: string;
  title: string;
  detail: string;
  tone: "yellow" | "green" | "zinc";
  href?: string;
};

function bookingHours(booking: BookingRequest) {
  return bookingCourtHours(booking);
}

function bookingAmount(booking: BookingRequest) {
  return bookingTotal(
    booking.plan,
    bookingHours(booking),
    readPlanUnitPrice(booking.plan),
  );
}

function startOfRange(preset: RangePreset): string | null {
  const now = new Date();
  if (preset === "all") return null;
  if (preset === "today") return dateKey(now);
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  return dateKey(start);
}

function inRange(isoDate: string, start: string | null, end: string) {
  if (!isoDate) return false;
  const day = isoDate.slice(0, 10);
  if (start && day < start) return false;
  return day <= end;
}

function createdDay(iso: string) {
  return iso.slice(0, 10);
}

function formatMoney(amount: number) {
  return `₱${amount.toLocaleString("en-PH")}`;
}

function formatActivityTime(iso: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminDashboardPage() {
  const [preset, setPreset] = useState<RangePreset>("all");
  const end = dateKey(new Date());
  const start = startOfRange(preset);

  const bookingsQuery = useAdminBookings({
    page: 1,
    limit: 100,
    sort: "createdAt",
    order: "desc",
  });
  const waitlistQuery = useAdminWaitlistList("");
  const foodOrdersQuery = useAdminFoodOrders({
    page: 1,
    limit: 40,
    order: "desc",
  });

  const bookings = useMemo(
    () => (bookingsQuery.data?.items ?? []).map(bookingDtoToRequest),
    [bookingsQuery.data?.items],
  );

  const waitlist = useMemo(
    () =>
      (waitlistQuery.data?.items ?? []).map((item) => ({
        joinedAt: item.createdAt,
        email: item.email,
        name: item.name,
      })),
    [waitlistQuery.data?.items],
  );

  const foodOrders = useMemo(
    () => foodOrdersQuery.data?.items ?? [],
    [foodOrdersQuery.data?.items],
  );

  const rangedBookings = useMemo(
    () =>
      bookings.filter((item) =>
        inRange(createdDay(item.createdAt), start, end),
      ),
    [bookings, start, end],
  );

  const totalSales = useMemo(
    () =>
      rangedBookings
        .filter((item) => item.status === "approved")
        .reduce((sum, item) => sum + bookingAmount(item), 0),
    [rangedBookings],
  );

  const totalBookings = rangedBookings.length;

  // Match /admin/players (waitlist leads), not seeded student accounts.
  const totalPlayers = waitlist.length;

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    for (const booking of bookings) {
      const plan = PLAN_META[booking.plan]?.title ?? booking.plan;
      items.push({
        id: `booking-${booking.id}`,
        at: booking.createdAt,
        title:
          booking.status === "approved"
            ? "Booking approved"
            : booking.status === "rejected"
              ? "Booking rejected"
              : "New booking request",
        detail: `${booking.name} · ${plan} · ${booking.date}`,
        tone:
          booking.status === "approved"
            ? "green"
            : booking.status === "pending"
              ? "yellow"
              : "zinc",
        href: "/admin/bookings",
      });
    }

    for (const order of foodOrders) {
      const status = foodOrderStatusLabel(order.status);
      const who = order.userName ?? order.userEmail ?? "Player";
      const summary = order.lines
        .map((line) => `${line.quantity}× ${line.name}`)
        .slice(0, 2)
        .join(", ");
      items.push({
        id: `food-${order.id}`,
        at: order.updatedAt || order.createdAt,
        title: `Food order · ${status}`,
        detail: `${who}${summary ? ` · ${summary}` : ""}`,
        tone:
          order.status === "ready"
            ? "green"
            : order.status === "preparing"
              ? "yellow"
              : "zinc",
        href: "/admin/food",
      });
    }

    return items
      .filter((item) => inRange(createdDay(item.at), start, end))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 10);
  }, [bookings, foodOrders, start, end]);

  const rangeLabel =
    PORTAL_RANGE_OPTIONS.find((item) => item.value === preset)?.label ??
    "Recent";

  const statsPending =
    (bookingsQuery.isPending && !bookingsQuery.data) ||
    (waitlistQuery.isPending && !waitlistQuery.data);
  const activityPending =
    bookingsQuery.isPending &&
    !bookingsQuery.data &&
    foodOrdersQuery.isPending &&
    !foodOrdersQuery.data;
  const bookingsError =
    bookingsQuery.isError && !bookingsQuery.data
      ? "Could not load bookings."
      : null;
  const foodError =
    foodOrdersQuery.isError && !foodOrdersQuery.data
      ? "Could not load food orders."
      : null;
  const activityError =
    bookingsError && foodError ? "Could not load recent activity." : null;

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppPageShell width="full" className="relative z-10 max-w-5xl">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="display text-[42px] text-zinc-900 sm:text-[52px]">
              Admin <span className="text-yellow">dashboard</span>
            </h1>
            <p className="text-sm text-zinc-500">
              Sales, bookings, and players · {rangeLabel.toLowerCase()}.
            </p>
          </div>

          <PortalRangeSelect
            value={preset}
            onChange={setPreset}
            label="Time range"
          />
        </header>

        {statsPending ? (
          <PortalStatSkeleton className="mt-6" />
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Total sales"
              value={formatMoney(totalSales)}
              hint="Approved bookings"
              icon={<PhilippinePeso size={18} aria-hidden />}
              iconClass="bg-yellow/20 text-yellow"
              to="/admin/bookings"
            />
            <StatCard
              label="Total bookings"
              value={String(totalBookings)}
              hint="Requests in range"
              icon={<ClipboardList size={18} aria-hidden />}
              iconClass="bg-green/15 text-green"
              to="/admin/bookings"
            />
            <StatCard
              label="Total players"
              value={String(totalPlayers)}
              hint="Newsletter & booking leads"
              icon={<Users size={18} aria-hidden />}
              iconClass="bg-green/15 text-green"
              to="/admin/players"
            />
          </div>
        )}

        <section className="mt-8 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-900">
              Recent activity
            </h2>
            <Link
              to="/admin/bookings"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition hover:text-yellow"
            >
              Open inbox
            </Link>
          </div>

          {activityPending ? (
            <PortalListSkeleton rows={5} />
          ) : activityError ? (
            <div
              className="rounded-2xl border border-dashed border-zinc-200 bg-white px-5 py-8 text-sm text-zinc-500"
              role="alert"
            >
              {activityError}
            </div>
          ) : activities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-5 py-8 text-sm text-zinc-500">
              No activity in this range yet.
            </div>
          ) : (
            <>
              {bookingsError || foodError ? (
                <p className="text-xs text-zinc-500" role="status">
                  {bookingsError ?? foodError} Showing what is available.
                </p>
              ) : null}
              <ul className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
                {activities.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-zinc-100 last:border-b-0"
                  >
                    {item.href ? (
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-start justify-between gap-3 px-4 py-3.5 transition hover:bg-zinc-50/80",
                          item.tone === "yellow" &&
                            "border-l-[3px] border-l-yellow",
                          item.tone === "green" &&
                            "border-l-[3px] border-l-green",
                        )}
                      >
                        <ActivityBody item={item} />
                      </Link>
                    ) : (
                      <div
                        className={cn(
                          "flex items-start justify-between gap-3 px-4 py-3.5",
                          item.tone === "yellow" &&
                            "border-l-[3px] border-l-yellow",
                          item.tone === "green" &&
                            "border-l-[3px] border-l-green",
                        )}
                      >
                        <ActivityBody item={item} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </AppPageShell>
    </div>
  );
}

function ActivityBody({ item }: { item: ActivityItem }) {
  return (
    <>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold tracking-tight",
            item.tone === "yellow" && "text-zinc-900",
            item.tone === "green" && "text-green",
            item.tone === "zinc" && "text-zinc-600",
          )}
        >
          {item.tone === "yellow" ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="size-1.5 shrink-0 rounded-full bg-yellow shadow-[0_0_0_3px_rgba(245,237,90,0.35)]"
                aria-hidden
              />
              {item.title}
            </span>
          ) : (
            item.title
          )}
        </p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{item.detail}</p>
      </div>
      <p className="shrink-0 text-[11px] text-zinc-400">
        {formatActivityTime(item.at)}
      </p>
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  iconClass,
  to,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  iconClass: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-zinc-200/80 bg-white p-4 transition hover:border-yellow/40 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </p>
        <span
          className={cn("grid size-9 place-items-center rounded-xl", iconClass)}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 display text-[28px] text-zinc-900 sm:text-[32px]">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </Link>
  );
}
