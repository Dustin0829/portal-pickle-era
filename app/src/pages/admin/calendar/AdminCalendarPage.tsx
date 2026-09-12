import { useState } from "react";
import { CourtDayGrid } from "@/components/portal/CourtDayGrid";
import { PortalBackdrop } from "@/components/portal/PortalBackdrop";
import { ensureBookingFixtures, listBookings } from "@/lib/booking/booking";

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AdminCalendarPage() {
  const [date, setDate] = useState(todayIso);
  ensureBookingFixtures();
  const bookings = listBookings();

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <PortalBackdrop variant="top" />

      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-5">
        <header className="mb-3 shrink-0 flex max-w-xl flex-col gap-1">
          <h1 className="display text-[32px] text-zinc-900 sm:text-[40px]">
            Court <span className="text-yellow">calendar</span>
          </h1>
          <p className="text-xs text-zinc-500 sm:text-sm">
            Ops view of occupancy. Approve or reject from the bookings inbox.
          </p>
        </header>

        <CourtDayGrid
          date={date}
          onDateChange={setDate}
          bookings={bookings}
          readOnly={false}
        />
      </div>
    </div>
  );
}
