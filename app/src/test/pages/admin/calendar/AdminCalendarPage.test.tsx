import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CourtDayGrid } from "@/components/portal/CourtDayGrid";
import { listBookings } from "@/lib/booking/booking";
import { AdminCalendarPage } from "@/pages/admin/calendar/AdminCalendarPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("AdminCalendarPage walk-in booking", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("lets admin book a walk-in from an open hour on the day schedule", async () => {
    const user = userEvent.setup();
    const onBookSlot = vi.fn();

    renderWithProviders(
      <CourtDayGrid
        date="2026-09-14"
        onDateChange={vi.fn()}
        bookings={[]}
        readOnly={false}
        bookIntent="walk-in"
        onBookSlot={onBookSlot}
      />,
    );

    expect(
      screen.getByText(/select open hours, then add a walk-in/i),
    ).toBeInTheDocument();

    await user.click(screen.getByText("14"));

    expect(
      screen.getByRole("heading", { name: /monday, sep 14, 2026/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "8:00 AM – 9:00 AM" }));
    await user.click(screen.getByRole("button", { name: /book walk-in/i }));

    expect(onBookSlot).toHaveBeenCalledWith({
      date: "2026-09-14",
      courtId: "in-1",
      slotIds: ["08:00"],
    });
  });

  it("creates an approved walk-in from the admin calendar day schedule", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminCalendarPage />);

    await user.click(screen.getByRole("button", { name: "Next month" }));
    await user.click(screen.getByText("15"));

    const openHour = screen.getByRole("button", { name: "6:00 AM – 7:00 AM" });
    await user.click(openHour);
    await user.click(screen.getByRole("button", { name: /book walk-in/i }));

    expect(
      screen.getByRole("heading", { name: /walk-in booking/i }),
    ).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Full name"), "Walk-in Guest");
    await user.click(screen.getByRole("button", { name: /create booking/i }));

    expect(
      screen.queryByRole("heading", { name: /walk-in booking/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/walk-in guest/i)).toBeInTheDocument();
    expect(listBookings().some((item) => item.name === "Walk-in Guest")).toBe(
      true,
    );
    expect(
      listBookings().find((item) => item.name === "Walk-in Guest")?.status,
    ).toBe("approved");
  });
});
