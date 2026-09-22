import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as AuthProvider from "@/providers/AuthProvider";
import { BookingModal } from "@/components/marketing/BookingModal";
import { earliestBookableDateKey } from "@/lib/booking/booking";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/bookings/bookings.service", () => ({
  listOccupancy: vi.fn(async () => []),
  listOpenPlaySessions: vi.fn(async () => []),
  createPublicBooking: vi.fn(),
}));

vi.mock("@/api/features/wallet/use-wallet", () => ({
  useMeWallet: () => ({
    data: { balanceCents: 50_000, topUps: [] },
    isPending: false,
    isError: false,
  }),
}));

vi.mock("lenis/react", () => ({
  useLenis: () => null,
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

describe("BookingModal credits gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("hides Pay with credits when allowCreditsPay is false (marketing)", async () => {
    vi.spyOn(AuthProvider, "useAuth").mockReturnValue(authMock);
    const date = earliestBookableDateKey();
    renderWithProviders(
      <BookingModal
        prefer="court"
        allowCreditsPay={false}
        preset={{
          date,
          courtId: "in-1",
          slotIds: ["08:00"],
          step: "pay",
        }}
        onClose={() => undefined}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/pay to book/i)).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /pay with credits/i }),
    ).not.toBeInTheDocument();
  });

  it("shows Pay with credits when allowCreditsPay is true", async () => {
    vi.spyOn(AuthProvider, "useAuth").mockReturnValue(authMock);
    const date = earliestBookableDateKey();
    renderWithProviders(
      <BookingModal
        prefer="court"
        allowCreditsPay={true}
        preset={{
          date,
          courtId: "in-1",
          slotIds: ["08:00"],
          step: "pay",
        }}
        onClose={() => undefined}
      />,
      { route: "/app/overview" },
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /pay with credits/i }),
      ).toBeInTheDocument();
    });
  });
});
