import { useMemo, useState } from "react";
import { ClipboardList, PhilippinePeso, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PortalBackdrop } from "@/components/portal/PortalBackdrop";
import { PortalRangeSelect } from "@/components/portal/PortalRangeSelect";
import {
  PORTAL_RANGE_OPTIONS,
  type PortalRangeValue,
} from "@/components/portal/portalRange";
import { listStudents } from "@/lib/auth/auth";
import {
  PLAN_META,
  bookingTotal,
  dateKey,
  ensureBookingFixtures,
  listBookings,
  type BookingRequest,
} from "@/lib/booking/booking";
import { cn } from "@/lib/utils";
import {
  ensureWaitlistFixtures,
  listWaitlistEntries,
} from "@/lib/waitlist/waitlistStorage";

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
  if (booking.plan === "court") return Math.max(booking.slotIds.length, 1);
  return 1;
}

function bookingAmount(booking: BookingRequest) {
  return bookingTotal(booking.plan, bookingHours(booking));
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
  const [preset, setPreset] = useState<RangePreset>("today");
  const end = dateKey(new Date());
  const start = startOfRange(preset);

  const bookings = useMemo(() => {
    ensureBookingFixtures();
    return listBookings();
  }, []);

  const waitlist = useMemo(() => {
    ensureWaitlistFixtures();
    return listWaitlistEntries();
  }, []);
  const students = useMemo(() => listStudents(), []);

  const rangedBookings = useMemo(
    () =>
      bookings.filter((item) =>
        inRange(createdDay(item.createdAt), start, end),
      ),
    [bookings, start, end],
  );

  const rangedWaitlist = useMemo(
    () =>
      waitlist.filter((item) => inRange(createdDay(item.joinedAt), start, end)),
    [waitlist, start, end],
  );

  const totalSales = useMemo(
    () =>
      rangedBookings
        .filter((item) => item.status === "approved")
        .reduce((sum, item) => sum + bookingAmount(item), 0),
    [rangedBookings],
  );

  const totalBookings = rangedBookings.length;

  const totalPlayers = useMemo(() => {
    const emails = new Set<string>();
    for (const student of students) {
      emails.add(student.email.toLowerCase());
    }
    for (const booking of rangedBookings) {
      if (booking.email) emails.add(booking.email.toLowerCase());
    }
    for (const lead of rangedWaitlist) {
      emails.add(lead.email.toLowerCase());
    }
    return emails.size;
  }, [students, rangedBookings, rangedWaitlist]);

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

    for (const lead of waitlist) {
      items.push({
        id: `waitlist-${lead.email}`,
        at: lead.joinedAt || new Date(0).toISOString(),
        title: "Joined waitlist",
        detail: `${lead.name || "No name"} · ${lead.email}`,
        tone: "yellow",
        href: "/admin/waitlist",
      });
    }

    return items
      .filter((item) => inRange(createdDay(item.at), start, end))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 10);
  }, [bookings, waitlist, start, end]);

  const rangeLabel =
    PORTAL_RANGE_OPTIONS.find((item) => item.value === preset)?.label ??
    "Recent";

  return (
    <div className="relative min-h-full overflow-hidden">
      <PortalBackdrop variant="top" />

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
            hint="Accounts, bookings & waitlist"
            icon={<Users size={18} aria-hidden />}
            iconClass="bg-green/15 text-green"
            to="/admin/waitlist"
          />
        </div>

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

          {activities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-5 py-8 text-sm text-zinc-500 shadow-sm">
              No activity in this range yet.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {activities.map((item) => (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      to={item.href}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white px-4 py-3.5 shadow-sm transition hover:border-yellow/40"
                    >
                      <ActivityBody item={item} />
                    </Link>
                  ) : (
                    <div className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white px-4 py-3.5 shadow-sm">
                      <ActivityBody item={item} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
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
            "text-sm font-semibold",
            item.tone === "yellow" && "text-yellow",
            item.tone === "green" && "text-green",
            item.tone === "zinc" && "text-zinc-900",
          )}
        >
          {item.title}
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
      className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-yellow/40 sm:p-5"
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
