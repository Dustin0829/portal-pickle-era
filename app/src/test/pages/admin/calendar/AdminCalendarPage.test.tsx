import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CourtDayGrid } from "@/components/portal/CourtDayGrid";
import { AdminCalendarPage } from "@/pages/admin/calendar/AdminCalendarPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";
import type { BookingRequest } from "@/lib/booking/booking";

const refetch = vi.fn();

vi.mock("@/api/features/bookings/bookings.service", () => ({
  createAdminBooking: vi.fn(),
  listOccupancy: vi.fn(async () => []),
  listOpenPlaySessions: vi.fn(async () => []),
}));

vi.mock("@/api/features/bookings/use-bookings", () => ({
  useAdminBookings: () => ({
    data: {
      items: [
        {
          id: "b-1",
          plan: "court",
          date: "2026-10-15",
          courtId: "in-1",
          slotIds: ["08:00"],
          name: "Alex Rivera",
          email: "alex@example.com",
          userId: "u-1",
          referenceId: "REF-1",
          receiptName: null,
          receiptKey: null,
          receiptMimeType: null,
          status: "approved",
          createdAt: "2026-10-15T00:00:00.000Z",
          updatedAt: "2026-10-15T00:00:00.000Z",
        },
      ],
    },
    isPending: false,
    isError: false,
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

const sampleBooking: BookingRequest = {
  id: "b-1",
  plan: "court",
  date: "2026-10-15",
  courtId: "in-1",
  slotIds: ["08:00"],
  name: "Alex Rivera",
  email: "alex@example.com",
  referenceId: "REF-1",
  receiptName: "",
  status: "approved",
  createdAt: "2026-10-15T00:00:00.000Z",
};

describe("AdminCalendarPage day bookings only", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    refetch.mockReset();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("opens a day sheet with that day's bookings and no walk-in path", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CourtDayGrid
        date="2026-10-15"
        onDateChange={vi.fn()}
        bookings={[sampleBooking]}
        bookingsOnly
      />,
    );

    expect(
      screen.getByText(/walk-in is on admin bookings/i),
    ).toBeInTheDocument();

    await user.click(screen.getByText("15"));

    expect(
      screen.getByRole("heading", { name: /thursday, october 15, 2026/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Alex Rivera", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText(/court 1/i)).toBeInTheDocument();
    expect(screen.getByText(/approved/i)).toBeInTheDocument();

    expect(screen.queryByText(/open hours/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /book walk-in/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /8:00 AM – 9:00 AM/i }),
    ).not.toBeInTheDocument();
  });

  it("shows empty state without open-hour or walk-in actions", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CourtDayGrid
        date="2026-10-14"
        onDateChange={vi.fn()}
        bookings={[]}
        bookingsOnly
      />,
    );

    await user.click(screen.getByText("14"));

    expect(screen.getByText(/no bookings for this day/i)).toBeInTheDocument();
    expect(
      screen.getByText(/walk-in create is on admin bookings/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/open hours/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /book walk-in/i }),
    ).not.toBeInTheDocument();
  });

  it("admin calendar page points walk-in to bookings and lists day bookings", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminCalendarPage />);

    expect(
      screen.getByText(/walk-in create is on admin bookings/i),
    ).toBeInTheDocument();

    for (let i = 0; i < 3; i += 1) {
      const heading = screen.queryByText(/october/i);
      if (heading) break;
      await user.click(screen.getByRole("button", { name: "Next month" }));
    }

    await user.click(screen.getByText("15"));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /thursday, october 15, 2026/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("Alex Rivera", { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /walk-in booking/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/open hours/i)).not.toBeInTheDocument();
  });
});
