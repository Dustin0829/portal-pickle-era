import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UnifiedBookingSchedule } from "@/components/booking/UnifiedBookingSchedule";
import { OPEN_PLAY_CAPACITY } from "@/lib/booking/booking";
import { OPEN_PLAY_RESERVED_LABEL } from "@/lib/booking/courtSlotPresentation";
import { EMPTY_UNIFIED_SELECTION } from "@/lib/booking/unifiedBookingSelection";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const morningSession = {
  id: "07:00",
  hour: 7,
  label: "7:00–9:00 AM",
  durationHours: 2,
};

const opLabel = (booked: number) =>
  `Open Play - ${booked}/${OPEN_PLAY_CAPACITY}`;

function renderSchedule(
  overrides: Partial<ComponentProps<typeof UnifiedBookingSchedule>> = {},
) {
  const onSelectionChange = vi.fn();
  const props = {
    date: "2026-10-05",
    month: new Date(2026, 9, 1),
    onMonthChange: vi.fn(),
    onDateChange: vi.fn(),
    bookableFloor: "2026-10-01",
    selection: EMPTY_UNIFIED_SELECTION,
    onSelectionChange,
    openPlaySlots: [morningSession],
    slotStatusByKey: new Map<string, "pending" | "approved">(),
    hoursBlockedByOpenPlay: new Set(["07:00", "08:00"]),
    bookedCountBySlotId: new Map<string, number>([["07:00", 12]]),
    occupancyLoading: false,
    capacityLoading: false,
    occupancyError: "",
    capacityError: "",
    ...overrides,
  };
  renderWithProviders(<UnifiedBookingSchedule {...props} />);
  return { onSelectionChange, props };
}

describe("UnifiedBookingSchedule yellow + inline Open Play", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses yellow chrome, no plan checkboxes, and mixes OP + Available in one grid", () => {
    const onBack = vi.fn();
    renderSchedule({ onBack });

    expect(screen.getByText(/select date & time/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^open play$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/private court/i)).not.toBeInTheDocument();

    const selectedDay = screen.getByRole("button", { name: /mon.*5.*oct/i });
    expect(selectedDay.className).toMatch(/bg-yellow/);

    expect(
      screen.queryByText(OPEN_PLAY_RESERVED_LABEL),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(opLabel(12)).length).toBe(6);
    expect(screen.getAllByText(/^available$/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /^back$/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it("selects Open Play session from an inline cell (Indoor)", () => {
    const { onSelectionChange } = renderSchedule();

    fireEvent.click(screen.getAllByText(opLabel(12))[0]!);
    expect(onSelectionChange).toHaveBeenCalledWith({
      plan: "open-play",
      courtId: "in-1",
      slotIds: ["07:00"],
    });
  });

  it("shows Open Play on Outdoor courts for covered hours", () => {
    renderSchedule({
      selection: {
        plan: "open-play",
        courtId: "in-1",
        slotIds: ["07:00"],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /^outdoor$/i }));
    expect(screen.getByText(/crt 4/i)).toBeInTheDocument();
    expect(screen.queryByText(/crt 1/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(opLabel(12)).length).toBe(6);
  });

  it("lets private court select on a non–Open-Play hour", () => {
    const { onSelectionChange } = renderSchedule();

    const courtBtn = screen.getByRole("button", {
      name: "Court 1 10:00 AM to 11:00 AM",
    });
    expect(courtBtn).toHaveTextContent(/available/i);
    fireEvent.click(courtBtn);
    expect(onSelectionChange).toHaveBeenCalledWith({
      plan: "court",
      courtId: "in-1",
      slotIds: ["10:00"],
    });
  });

  it("shows only private rows when there are no Open Play sessions", () => {
    renderSchedule({
      openPlaySlots: [],
      hoursBlockedByOpenPlay: new Set(),
    });

    expect(screen.queryByText(/open play -/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/^available$/i).length).toBeGreaterThan(0);
  });

  it("marks all covered Open Play cells selected for a multi-hour session", () => {
    renderSchedule({
      selection: {
        plan: "open-play",
        courtId: "in-1",
        slotIds: ["07:00"],
      },
    });

    const selected = screen
      .getAllByText(opLabel(12))
      .filter((el) => el.className.includes("bg-yellow"));
    expect(selected.length).toBe(6);
  });

  it("disables full Open Play cells", () => {
    renderSchedule({
      bookedCountBySlotId: new Map([["07:00", OPEN_PLAY_CAPACITY]]),
    });

    const fullCells = screen.getAllByText(
      `Full - ${OPEN_PLAY_CAPACITY}/${OPEN_PLAY_CAPACITY}`,
    );
    expect(fullCells.length).toBe(6);
    expect(fullCells[0]).toBeDisabled();
  });

  it("keeps private hold over Open Play presentation", () => {
    renderSchedule({
      slotStatusByKey: new Map([["in-1|07:00", "approved"]]),
    });

    const grid = screen.getByRole("grid", { name: /indoor court day grid/i });
    expect(within(grid).getByText(/^taken$/i)).toBeInTheDocument();
    expect(within(grid).getAllByText(opLabel(12)).length).toBeGreaterThan(0);
  });
});
