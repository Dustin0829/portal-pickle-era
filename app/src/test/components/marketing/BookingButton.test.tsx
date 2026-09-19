import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookingButton } from "@/components/marketing/BookingButton";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/bookings/bookings.service", () => ({
  listOccupancy: vi.fn().mockResolvedValue([]),
  listOpenPlaySessions: vi.fn().mockResolvedValue([]),
  createPublicBooking: vi.fn(),
}));

describe("BookingButton", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults label to Book a court and opens booking modal on opening month", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingButton />);

    const button = screen.getByRole("button", { name: /book a court/i });
    await user.click(button);

    expect(screen.getByText(/select date & time/i)).toBeInTheDocument();
    expect(screen.queryByText(/private court/i)).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText(/^available$/i).length).toBeGreaterThan(0);
    });
  });

  it("renders children label when provided", () => {
    renderWithProviders(<BookingButton>Reserve now</BookingButton>);
    expect(
      screen.getByRole("button", { name: /reserve now/i }),
    ).toBeInTheDocument();
  });
});
