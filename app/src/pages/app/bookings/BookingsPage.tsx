import { AppPageShell } from "@/components/layout/AppPageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import {
  COURTS,
  PLAN_META,
  listBookingsByEmail,
  type BookingRequest,
} from "@/lib/booking/booking";
import { useAuth } from "@/providers/AuthProvider";

export function BookingsPage() {
  const { user } = useAuth();
  const bookings = user ? listBookingsByEmail(user.email) : [];

  return (
    <AppPageShell>
      <PageHeader
        title="My bookings"
        description="Requests tied to your account email. Guest bookings show up when the email matches."
      />
      <PageSection>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bookings for {user?.email ?? "this account"} yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {bookings.map((item) => (
              <BookingRow key={item.id} booking={item} />
            ))}
          </ul>
        )}
      </PageSection>
    </AppPageShell>
  );
}

function BookingRow({ booking }: { booking: BookingRequest }) {
  const court = COURTS.find((item) => item.id === booking.courtId);
  const meta = PLAN_META[booking.plan];

  return (
    <li className="rounded-lg border border-border px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{meta.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {booking.date}
            {court ? ` · ${court.name}` : ""}
            {booking.slotIds.length ? ` · ${booking.slotIds.join(", ")}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ref {booking.referenceId}
            {booking.receiptName ? ` · ${booking.receiptName}` : ""}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: BookingRequest["status"] }) {
  const label =
    status === "pending"
      ? "Pending"
      : status === "approved"
        ? "Approved"
        : "Rejected";
  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
      {label}
    </span>
  );
}
