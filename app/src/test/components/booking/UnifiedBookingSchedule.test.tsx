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

  it("uses yellow selected date strip and has no colspan Open Play band", () => {
    const onBack = vi.fn();
    renderSchedule({ onBack });

    expect(screen.getByText(/select date & time/i)).toBeInTheDocument();
    const selectedDay = screen.getByRole("button", { name: /mon.*5.*oct/i });
    expect(selectedDay.className).toMatch(/bg-yellow/);
    expect(selectedDay.className).not.toMatch(/bg-zinc-900/);

    expect(
      screen.queryByText(OPEN_PLAY_RESERVED_LABEL),
    ).not.toBeInTheDocument();
    // No wide OP band — Private Court plan shows Available on covered hours
    expect(screen.queryByText(/open play · 12\/30/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/^available$/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /^back$/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it("shows Open Play in hour×court cells when Open Play plan is active (Indoor)", () => {
    const { onSelectionChange } = renderSchedule({
      selection: { plan: "open-play", courtId: "in-1", slotIds: [] },
      prefer: "open-play",
    });

    const opCells = screen.getAllByText(`Open Play · 12/${OPEN_PLAY_CAPACITY}`);
    // 2 covered hours × 3 indoor courts
    expect(opCells.length).toBe(6);

    fireEvent.click(opCells[0]!);
    expect(onSelectionChange).toHaveBeenCalledWith({
      plan: "open-play",
      courtId: "in-1",
      slotIds: ["07:00"],
    });
  });

  it("shows Open Play on Outdoor courts when Outdoor + Open Play plan", () => {
    renderSchedule({
      selection: { plan: "open-play", courtId: "in-1", slotIds: ["07:00"] },
      prefer: "open-play",
    });

    fireEvent.click(screen.getByRole("button", { name: /^outdoor$/i }));
    expect(screen.getByText(/crt 4/i)).toBeInTheDocument();
    expect(screen.queryByText(/crt 1/i)).not.toBeInTheDocument();
    expect(
      screen.getAllByText(`Open Play · 12/${OPEN_PLAY_CAPACITY}`).length,
    ).toBe(6);
  });

  it("lets Private Court plan select a court hour covered by Open Play", () => {
    const { onSelectionChange } = renderSchedule({
      selection: EMPTY_UNIFIED_SELECTION,
      prefer: "court",
    });

    const courtBtn = screen.getByRole("button", {
      name: "Court 1 7:00 AM to 8:00 AM",
    });
    expect(courtBtn).toHaveTextContent(/available/i);
    expect(courtBtn).not.toBeDisabled();
    fireEvent.click(courtBtn);
    expect(onSelectionChange).toHaveBeenCalledWith({
      plan: "court",
      courtId: "in-1",
      slotIds: ["07:00"],
    });
  });

  it("shows only private rows when there are no Open Play sessions", () => {
    renderSchedule({
      openPlaySlots: [],
      hoursBlockedByOpenPlay: new Set(),
      selection: { plan: "open-play", courtId: "in-1", slotIds: [] },
      prefer: "open-play",
    });

    expect(screen.queryByText(/open play ·/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/^available$/i).length).toBeGreaterThan(0);
  });

  it("marks all covered Open Play cells selected for a multi-hour session", () => {
    renderSchedule({
      selection: {
        plan: "open-play",
        courtId: "in-1",
        slotIds: ["07:00"],
      },
      prefer: "open-play",
    });

    const selected = screen
      .getAllByText(`Open Play · 12/${OPEN_PLAY_CAPACITY}`)
      .filter((el) => el.className.includes("bg-yellow"));
    expect(selected.length).toBe(6);
  });

  it("disables full Open Play cells", () => {
    renderSchedule({
      selection: { plan: "open-play", courtId: "in-1", slotIds: [] },
      prefer: "open-play",
      bookedCountBySlotId: new Map([["07:00", OPEN_PLAY_CAPACITY]]),
    });

    const fullCells = screen.getAllByText(
      `Full · ${OPEN_PLAY_CAPACITY}/${OPEN_PLAY_CAPACITY}`,
    );
    expect(fullCells.length).toBe(6);
    expect(fullCells[0]).toBeDisabled();
  });

  it("keeps private hold over Open Play presentation", () => {
    renderSchedule({
      selection: { plan: "open-play", courtId: "in-1", slotIds: [] },
      prefer: "open-play",
      slotStatusByKey: new Map([["in-1|07:00", "approved"]]),
    });

    const grid = screen.getByRole("grid", { name: /indoor court day grid/i });
    expect(within(grid).getByText(/^taken$/i)).toBeInTheDocument();
    // Other courts still show Open Play on that hour
    expect(
      within(grid).getAllByText(`Open Play · 12/${OPEN_PLAY_CAPACITY}`).length,
    ).toBeGreaterThan(0);
  });
});
