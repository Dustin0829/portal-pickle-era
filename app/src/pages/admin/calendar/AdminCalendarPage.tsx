import { useState } from "react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { CourtDayGrid } from "@/components/portal/CourtDayGrid";
import { listBookings } from "@/lib/booking/booking";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminCalendarPage() {
  const [date, setDate] = useState(todayIso);
  const bookings = listBookings();

  return (
    <AppPageShell width="full">
      <PageHeader
        title="Court calendar"
        description="Ops view of court occupancy. Approve or reject requests from the bookings inbox."
      />
      <PageSection>
        <CourtDayGrid
          date={date}
          onDateChange={setDate}
          bookings={bookings}
          readOnly={false}
        />
      </PageSection>
    </AppPageShell>
  );
}
