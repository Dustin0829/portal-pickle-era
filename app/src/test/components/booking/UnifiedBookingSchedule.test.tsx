import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UnifiedBookingSchedule } from "@/components/booking/UnifiedBookingSchedule";
import { OPEN_PLAY_RESERVED_LABEL } from "@/lib/booking/courtSlotPresentation";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("UnifiedBookingSchedule reference layout", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows date strip, plan chooser, Indoor courts, and Open Play wide cell", () => {
    const onSelectionChange = vi.fn();
    const onBack = vi.fn();
    const selection = {
      plan: "court" as const,
      courtId: "out-1",
      slotIds: ["10:00"],
    };

    renderWithProviders(
      <UnifiedBookingSchedule
        date="2026-10-05"
        month={new Date(2026, 9, 1)}
        onMonthChange={vi.fn()}
        onDateChange={vi.fn()}
        bookableFloor="2026-10-01"
        selection={selection}
        onSelectionChange={onSelectionChange}
        onBack={onBack}
        openPlaySlots={[
          { id: "07:00", hour: 7, label: "7:00–9:00 AM", durationHours: 2 },
        ]}
        slotStatusByKey={new Map()}
        hoursBlockedByOpenPlay={new Set(["11:00"])}
        bookedCountBySlotId={new Map()}
        occupancyLoading={false}
        capacityLoading={false}
        occupancyError=""
        capacityError=""
      />,
    );

    expect(screen.getByText(/select date & time/i)).toBeInTheDocument();
    expect(screen.getByText(/private court/i)).toBeInTheDocument();
    expect(screen.getByText(/crt 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/crt 4/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/open play/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(OPEN_PLAY_RESERVED_LABEL).length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /^back$/i }));
    expect(onBack).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /^outdoor$/i }));
    expect(screen.getByText(/crt 4/i)).toBeInTheDocument();
    expect(screen.queryByText(/crt 1/i)).not.toBeInTheDocument();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
