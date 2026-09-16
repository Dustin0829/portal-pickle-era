import { useMemo, useState } from "react";
import { CourtDayGrid } from "@/components/portal/CourtDayGrid";
import { PortalBackdrop } from "@/components/portal/PortalBackdrop";
import { useOccupancy } from "@/api/features/bookings/use-bookings";
import { occupancyToBookingRequest } from "@/lib/booking/mapBooking";
import { useBookingModal } from "@/providers/BookingModalProvider";

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthBounds(iso: string) {
  const [year, month] = iso.split("-").map(Number);
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

export function CalendarPage() {
  const { openBookingModal } = useBookingModal();
  const [date, setDate] = useState(todayIso);
  const bounds = useMemo(() => monthBounds(date), [date]);
  const occupancy = useOccupancy(bounds);
  const bookings = useMemo(
    () => (occupancy.data ?? []).map(occupancyToBookingRequest),
    [occupancy.data],
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <PortalBackdrop variant="top" />

      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-5">
        <header className="mb-3 flex shrink-0 max-w-xl flex-col gap-1">
          <h1 className="display text-[32px] text-zinc-900 sm:text-[40px]">
            Court <span className="text-yellow">calendar</span>
          </h1>
          <p className="text-xs text-zinc-500 sm:text-sm">
            Pick open hours to book and pay. Taken slots stay locked.
          </p>
        </header>

        <CourtDayGrid
          date={date}
          onDateChange={setDate}
          bookings={bookings}
          readOnly={false}
          onBookSlot={({ date: slotDate, courtId, slotIds }) => {
            openBookingModal("court", {
              date: slotDate,
              courtId,
              slotIds,
              step: "pay",
            });
          }}
        />
      </div>
    </div>
  );
}
