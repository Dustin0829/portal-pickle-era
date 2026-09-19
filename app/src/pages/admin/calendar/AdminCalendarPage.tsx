import { useMemo, useState } from "react";
import { CourtDayGrid } from "@/components/portal/CourtDayGrid";
import { PortalCalendarSkeleton } from "@/components/portal/portal-skeletons";
import { WalkInBookingModal } from "@/components/portal/WalkInBookingModal";
import { useAdminBookings } from "@/api/features/bookings/use-bookings";
import { bookingDtoToRequest } from "@/lib/booking/mapBooking";

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AdminCalendarPage() {
  const [date, setDate] = useState(todayIso);
  const [walkIn, setWalkIn] = useState<{
    date: string;
    courtId: string;
    slotIds: string[];
  } | null>(null);
  const { data, isPending, isError, refetch } = useAdminBookings({
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
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-3 flex max-w-xl shrink-0 flex-col gap-1">
          <h1 className="display text-[32px] text-zinc-900 sm:text-[40px]">
            Court <span className="text-yellow">calendar</span>
          </h1>
          <p className="text-xs text-zinc-500 sm:text-sm">
            Tap a day to add walk-in bookings on open hours. Approve GCash
            requests from the bookings inbox.
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
            readOnly={false}
            bookIntent="walk-in"
            keepOpenOnBook
            onBookSlot={setWalkIn}
          />
        )}
      </div>

      {walkIn ? (
        <WalkInBookingModal
          initial={{ plan: "court", ...walkIn }}
          onClose={() => setWalkIn(null)}
          onCreated={() => {
            setWalkIn(null);
            void refetch();
          }}
        />
      ) : null}
    </div>
  );
}
