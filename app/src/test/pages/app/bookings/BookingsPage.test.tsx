import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as AuthProvider from "@/providers/AuthProvider";
import { BookingsPage } from "@/pages/app/bookings/BookingsPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const getMeBookingReceiptUrl = vi.fn();
const bookingsState = vi.hoisted(() => ({
  items: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/api/features/bookings/bookings.service", () => ({
  getMeBookingReceiptUrl: (...args: unknown[]) =>
    getMeBookingReceiptUrl(...args),
}));

vi.mock("@/api/features/bookings/use-bookings", () => ({
  useMyBookings: () => ({
    data: bookingsState.items,
    isPending: false,
    isError: false,
  }),
  useCreatePublicBooking: () => ({ mutateAsync: vi.fn() }),
  useMeOpenPlayFifoPosition: () => ({
    data: undefined,
    isPending: false,
    isError: false,
  }),
}));

const authMock = {
  user: {
    id: "u1",
    name: "Ada",
    email: "ada@example.com",
    role: "student" as const,
    imageUrl: null,
  },
  status: "authenticated" as const,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
  resetPassword: vi.fn(),
};

function baseBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: "bk-1",
    plan: "court",
    date: "2026-10-05",
    courtId: "in-1",
    slotIds: ["08:00"],
    courtSlots: [{ courtId: "in-1", slotIds: ["08:00"] }],
    name: "Ada",
    email: "ada@example.com",
    userId: "u1",
    referenceId: "REF-1",
    receiptName: "gcash.jpg",
    receiptKey: "receipts/a.jpg",
    receiptMimeType: "image/jpeg",
    walletAppliedCents: 0,
    status: "pending",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("BookingsPage receipt preview", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    bookingsState.items = [];
    getMeBookingReceiptUrl.mockReset();
    vi.spyOn(AuthProvider, "useAuth").mockReturnValue(authMock);
  });

  it("fetches signed URL and shows image when receiptKey is present", async () => {
    const user = userEvent.setup();
    bookingsState.items = [baseBooking()];
    getMeBookingReceiptUrl.mockResolvedValue({
      url: "https://cdn.example/receipt.jpg",
      expiresAt: "2026-10-05T01:00:00.000Z",
    });

    renderWithProviders(<BookingsPage />, { route: "/app/bookings" });

    await user.click(screen.getByRole("button", { name: /court rental/i }));

    await waitFor(() => {
      expect(getMeBookingReceiptUrl).toHaveBeenCalledWith(
        "bk-1",
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(
        screen.getByRole("img", { name: /payment receipt|gcash/i }),
      ).toHaveAttribute("src", "https://cdn.example/receipt.jpg");
    });
    expect(
      screen.queryByText(/only saved the filename/i),
    ).not.toBeInTheDocument();
  });

  it("shows filename-only copy when receiptName exists without receiptKey", async () => {
    const user = userEvent.setup();
    bookingsState.items = [
      baseBooking({
        receiptKey: null,
        receiptMimeType: null,
      }),
    ];

    renderWithProviders(<BookingsPage />, { route: "/app/bookings" });

    await user.click(screen.getByRole("button", { name: /court rental/i }));

    expect(getMeBookingReceiptUrl).not.toHaveBeenCalled();
    expect(screen.getAllByText(/gcash\.jpg/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/only saved the filename/i)).toBeInTheDocument();
  });

  it("shows load-failure copy when receipt-url request fails", async () => {
    const user = userEvent.setup();
    bookingsState.items = [baseBooking()];
    getMeBookingReceiptUrl.mockRejectedValue(new Error("storage unset"));

    renderWithProviders(<BookingsPage />, { route: "/app/bookings" });

    await user.click(screen.getByRole("button", { name: /court rental/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not load receipt/i)).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/only saved the filename/i),
    ).not.toBeInTheDocument();
  });
});
