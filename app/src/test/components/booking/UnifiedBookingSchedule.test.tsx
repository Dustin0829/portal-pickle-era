import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UnifiedBookingSchedule } from "@/components/booking/UnifiedBookingSchedule";
import { OPEN_PLAY_RESERVED_LABEL } from "@/lib/booking/courtSlotPresentation";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("UnifiedBookingSchedule Indoor/Outdoor", () => {
  afterEach(() => {
    cleanup();
  });

  it("defaults to Indoor courts and retains selection when toggling", () => {
    const onSelectionChange = vi.fn();
    const selection = {
      plan: "court" as const,
      courtId: "out-1",
      slotIds: ["10"],
      openPlaySlotId: null,
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
        openPlaySlots={[
          { id: "op-7", hour: 7, label: "7–9 AM", durationHours: 2 },
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

    expect(screen.getByText("Court 1")).toBeInTheDocument();
    expect(screen.queryByText("Court 4")).not.toBeInTheDocument();
    expect(
      screen.getAllByText(OPEN_PLAY_RESERVED_LABEL).length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /^outdoor$/i }));
    expect(screen.getByText("Court 4")).toBeInTheDocument();
    expect(screen.queryByText("Court 1")).not.toBeInTheDocument();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
