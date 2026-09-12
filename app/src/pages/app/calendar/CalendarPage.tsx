import { useState } from "react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { CourtDayGrid } from "@/components/portal/CourtDayGrid";
import { listBookings } from "@/lib/booking/booking";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function CalendarPage() {
  const [date, setDate] = useState(todayIso);
  const bookings = listBookings();

  return (
    <AppPageShell width="full">
      <PageHeader
        title="Court calendar"
        description="See which court hours look taken. You can’t change bookings from here."
      />
      <PageSection>
        <CourtDayGrid
          date={date}
          onDateChange={setDate}
          bookings={bookings}
          readOnly
        />
      </PageSection>
    </AppPageShell>
  );
}
