import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CourtDayGrid } from "@/components/portal/CourtDayGrid";
import { AdminCalendarPage } from "@/pages/admin/calendar/AdminCalendarPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const createAdminBooking = vi.fn();
const refetch = vi.fn();

vi.mock("@/api/features/bookings/bookings.service", () => ({
  createAdminBooking: (...args: unknown[]) => createAdminBooking(...args),
  listOccupancy: vi.fn(async () => []),
  listOpenPlaySessions: vi.fn(async () => []),
}));

vi.mock("@/api/features/bookings/use-bookings", () => ({
  useAdminBookings: () => ({
    data: { items: [] },
    isLoading: false,
    refetch,
  }),
  useOccupancy: () => ({ data: [], isLoading: false }),
  useMyBookings: () => ({ data: [], isLoading: false }),
  useAdminUsers: () => ({ data: { items: [] }, isLoading: false }),
  usePatchAdminBooking: () => ({ mutateAsync: vi.fn() }),
  useCreateAdminBooking: () => ({ mutateAsync: vi.fn() }),
  useCreatePublicBooking: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/api/features/auth/auth.service", () => ({
  getMe: vi.fn(async () => {
    const err = new Error("Unauthorized") as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }),
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  patchMe: vi.fn(),
}));

describe("AdminCalendarPage walk-in booking", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    createAdminBooking.mockReset();
    refetch.mockReset();
  });

  beforeEach(() => {
    localStorage.clear();
    createAdminBooking.mockResolvedValue({
      id: "b-walkin",
      plan: "court",
      date: "2026-09-15",
      courtId: "in-1",
      slotIds: ["06:00"],
      name: "Walk-in Guest",
      email: "walk-in@pickleera.local",
      userId: null,
      referenceId: "WALK-IN",
      receiptName: "Walk-in / cash",
      receiptKey: null,
      receiptMimeType: null,
      status: "approved",
      createdAt: "2026-09-15T00:00:00.000Z",
      updatedAt: "2026-09-15T00:00:00.000Z",
    });
  });

  it("lets admin book a walk-in from an open hour on the day schedule", async () => {
    const user = userEvent.setup();
    const onBookSlot = vi.fn();

    renderWithProviders(
      <CourtDayGrid
        date="2026-10-14"
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
      screen.getByRole("heading", { name: /wednesday, october 14, 2026/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "8:00 AM – 9:00 AM" }));
    await user.click(screen.getByRole("button", { name: /book walk-in/i }));

    expect(onBookSlot).toHaveBeenCalledWith({
      date: "2026-10-14",
      courtId: "in-1",
      slotIds: ["08:00"],
    });
  });

  it("creates an approved walk-in from the admin calendar day schedule", async () => {
    const user = userEvent.setup();
    createAdminBooking.mockResolvedValue({
      id: "b-walkin",
      plan: "court",
      date: "2026-10-15",
      courtId: "in-1",
      slotIds: ["06:00"],
      name: "Walk-in Guest",
      email: "walk-in@pickleera.local",
      userId: null,
      referenceId: "WALK-IN",
      receiptName: "Walk-in / cash",
      receiptKey: null,
      receiptMimeType: null,
      status: "approved",
      createdAt: "2026-10-15T00:00:00.000Z",
      updatedAt: "2026-10-15T00:00:00.000Z",
    });

    renderWithProviders(<AdminCalendarPage />);

    // Jump from "today" toward October opening month if needed.
    for (let i = 0; i < 3; i += 1) {
      const heading = screen.queryByRole("heading", {
        name: /october/i,
      });
      if (heading) break;
      await user.click(screen.getByRole("button", { name: "Next month" }));
    }

    await user.click(screen.getByText("15"));

    const openHour = screen.getByRole("button", { name: "6:00 AM – 7:00 AM" });
    await user.click(openHour);
    await user.click(screen.getByRole("button", { name: /book walk-in/i }));

    expect(
      screen.getByRole("heading", { name: /walk-in booking/i }),
    ).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Full name"), "Walk-in Guest");
    await user.click(screen.getByRole("button", { name: /create booking/i }));

    await waitFor(() => {
      expect(createAdminBooking).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: /walk-in booking/i }),
      ).not.toBeInTheDocument();
    });
    expect(refetch).toHaveBeenCalled();
  });
});
