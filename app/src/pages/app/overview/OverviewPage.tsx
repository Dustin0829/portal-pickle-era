import { Link } from "react-router-dom";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { Button } from "@/components/ui/button";
import { listBookingsByEmail } from "@/lib/booking/booking";
import { useAuth } from "@/providers/AuthProvider";
import { useBookingModal } from "@/providers/BookingModalProvider";

export function OverviewPage() {
  const { user } = useAuth();
  const { openBookingModal } = useBookingModal();
  const bookings = user ? listBookingsByEmail(user.email) : [];
  const pending = bookings.filter((item) => item.status === "pending").length;
  const approved = bookings.filter((item) => item.status === "approved").length;

  return (
    <AppPageShell>
      <PageHeader
        title={`Hi, ${user?.name.split(" ")[0] ?? "there"}`}
        description="Track your court requests and see what’s coming up."
        action={
          <Button type="button" onClick={() => openBookingModal("court")}>
            Book a court
          </Button>
        }
      />
      <PageSection>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total requests" value={String(bookings.length)} />
          <Stat label="Pending" value={String(pending)} />
          <Stat label="Approved" value={String(approved)} />
        </div>
      </PageSection>
      <PageSection bordered>
        {bookings.length === 0 ? (
          <EmptyOverview onBook={() => openBookingModal("court")} />
        ) : (
          <ul className="flex flex-col gap-2">
            {bookings.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{item.date}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.plan} · {item.status}
                  </p>
                </div>
                <Link
                  to="/app/bookings"
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageSection>
    </AppPageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function EmptyOverview({ onBook }: { onBook: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        You don’t have any booking requests yet. Book from the marketing site or
        start here.
      </p>
      <Button type="button" variant="outline" onClick={onBook}>
        Start a booking
      </Button>
    </div>
  );
}
