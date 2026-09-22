import { useMemo, useState } from "react";
import {
  appContentPaddingClass,
  appContentWidthClass,
} from "@/components/layout/layout.constants";
import { CourtDayGrid } from "@/components/portal/CourtDayGrid";
import { PortalCalendarSkeleton } from "@/components/portal/portal-skeletons";
import { useAdminBookings } from "@/api/features/bookings/use-bookings";
import { bookingDtoToRequest } from "@/lib/booking/mapBooking";
import { cn } from "@/lib/utils";

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AdminCalendarPage() {
  const [date, setDate] = useState(todayIso);
  const { data, isPending, isError } = useAdminBookings({
    page: 1,
    limit: 100,
    sort: "date",
    order: "asc",
  });
  const bookings = useMemo(
    () => (data?.items ?? []).map(bookingDtoToRequest),
    [data?.items],
  );
  const calendarPending = isPending && !data;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className={cn(
          "relative z-10 mx-auto flex h-full min-h-0 w-full flex-col py-8 sm:py-10",
          appContentPaddingClass,
          appContentWidthClass.wide,
        )}
      >
        <header className="mb-3 flex max-w-xl shrink-0 flex-col gap-1">
          <h1 className="display text-[28px] text-zinc-900 sm:text-[32px]">
            Court <span className="text-yellow">calendar</span>
          </h1>
          <p className="text-xs text-zinc-500 sm:text-sm">
            Tap a day to see that day&apos;s bookings. Walk-in create is on
            Admin Bookings.
          </p>
        </header>

        {calendarPending ? (
          <PortalCalendarSkeleton />
        ) : isError && !data ? (
          <div
            className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-8 text-sm text-zinc-500"
            role="alert"
          >
            Could not load calendar bookings.
          </div>
        ) : (
          <CourtDayGrid
            date={date}
            onDateChange={setDate}
            bookings={bookings}
            bookingsOnly
          />
        )}
      </div>
    </div>
  );
}
