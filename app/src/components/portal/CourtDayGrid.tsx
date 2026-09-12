import {
  COURTS,
  PLAN_META,
  SLOTS,
  type BookingRequest,
  type BookingStatus,
} from "@/lib/booking/booking";
import { cn } from "@/lib/utils";

type CourtDayGridProps = {
  date: string;
  onDateChange: (date: string) => void;
  bookings: BookingRequest[];
  /** When true, cells are informational only (student calendar). */
  readOnly?: boolean;
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  approved: "Booked",
  rejected: "Rejected",
};

function occupancyKey(courtId: string, slotId: string) {
  return `${courtId}::${slotId}`;
}

export function CourtDayGrid({
  date,
  onDateChange,
  bookings,
  readOnly = true,
}: CourtDayGridProps) {
  const courtSlots = SLOTS.court;
  const dayBookings = bookings.filter(
    (item) =>
      item.date === date && item.plan === "court" && item.status !== "rejected",
  );

  const occupied = new Map<string, BookingRequest>();
  for (const booking of dayBookings) {
    for (const slotId of booking.slotIds) {
      occupied.set(occupancyKey(booking.courtId, slotId), booking);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex max-w-xs flex-col gap-1 text-sm">
        <span className="font-medium">Date</span>
        <input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3"
        />
      </label>

      <p className="text-sm text-muted-foreground">
        {PLAN_META.court.title} occupancy
        {readOnly ? " · read-only" : ""}. Pending and approved requests block a
        slot.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-[640px] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="sticky left-0 bg-muted/40 px-3 py-2 font-medium">
                Court
              </th>
              {courtSlots.map((slot) => (
                <th
                  key={slot.id}
                  className="px-2 py-2 font-medium whitespace-nowrap"
                >
                  {slot.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COURTS.map((court) => (
              <tr
                key={court.id}
                className="border-b border-border last:border-0"
              >
                <th className="sticky left-0 bg-background px-3 py-2 font-medium whitespace-nowrap">
                  {court.name}
                  <span className="ml-1 text-muted-foreground">
                    ({court.group})
                  </span>
                </th>
                {courtSlots.map((slot) => {
                  const booking = occupied.get(occupancyKey(court.id, slot.id));
                  return (
                    <td key={slot.id} className="px-1 py-1 align-middle">
                      <div
                        className={cn(
                          "min-h-9 rounded px-1.5 py-1",
                          booking
                            ? booking.status === "pending"
                              ? "bg-amber-500/15 text-amber-900 dark:text-amber-100"
                              : "bg-primary/15 text-foreground"
                            : "bg-muted/30 text-muted-foreground",
                        )}
                        title={
                          booking
                            ? `${booking.name} · ${STATUS_LABEL[booking.status]}`
                            : "Open"
                        }
                      >
                        {booking ? STATUS_LABEL[booking.status] : "Open"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
