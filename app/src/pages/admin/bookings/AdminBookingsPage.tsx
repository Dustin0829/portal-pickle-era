import { useState } from "react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { Button } from "@/components/ui/button";
import {
  COURTS,
  PLAN_META,
  listBookings,
  updateBookingStatus,
  type BookingRequest,
  type BookingStatus,
} from "@/lib/booking/booking";

export function AdminBookingsPage() {
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [tick, setTick] = useState(0);
  void tick;
  const bookings = listBookings().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const visible =
    filter === "pending"
      ? bookings.filter((item) => item.status === "pending")
      : bookings;

  function setStatus(id: string, status: BookingStatus) {
    updateBookingStatus(id, status);
    setTick((value) => value + 1);
  }

  return (
    <AppPageShell width="full">
      <PageHeader
        title="Bookings inbox"
        description="Approve or reject GCash booking requests stored locally."
        action={
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button
              type="button"
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
          </div>
        }
      />
      <PageSection>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {filter === "pending"
              ? "No pending booking requests."
              : "No booking requests yet."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((item) => (
              <AdminBookingRow
                key={item.id}
                booking={item}
                onApprove={() => setStatus(item.id, "approved")}
                onReject={() => setStatus(item.id, "rejected")}
              />
            ))}
          </ul>
        )}
      </PageSection>
    </AppPageShell>
  );
}

function AdminBookingRow({
  booking,
  onApprove,
  onReject,
}: {
  booking: BookingRequest;
  onApprove: () => void;
  onReject: () => void;
}) {
  const court = COURTS.find((item) => item.id === booking.courtId);
  const meta = PLAN_META[booking.plan];

  return (
    <li className="rounded-lg border border-border px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            {booking.name} · {meta.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {booking.email} · {booking.date}
            {court ? ` · ${court.name}` : ""}
            {booking.slotIds.length ? ` · ${booking.slotIds.join(", ")}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ref {booking.referenceId}
            {booking.receiptName ? ` · receipt: ${booking.receiptName}` : ""}
          </p>
          <p className="mt-1 text-xs font-medium capitalize">
            {booking.status}
          </p>
        </div>
        {booking.status === "pending" ? (
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={onApprove}>
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onReject}
            >
              Reject
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
