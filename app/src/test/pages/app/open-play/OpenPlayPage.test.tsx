import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as AuthProvider from "@/providers/AuthProvider";
import { OpenPlayPage } from "@/pages/app/open-play/OpenPlayPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const bookingsState = vi.hoisted(() => ({
  items: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/api/features/bookings/use-bookings", () => ({
  useMyBookings: () => ({
    data: bookingsState.items,
    isPending: false,
    isError: false,
  }),
  useMeOpenPlayFifoBoard: () => ({
    data: undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/lib/booking/openPlaySlots", () => ({
  useOpenPlaySlots: () => [
    { id: "07:00", label: "7–9 AM", hour: 7, durationHours: 2 },
  ],
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

describe("OpenPlayPage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    bookingsState.items = [];
    vi.spyOn(AuthProvider, "useAuth").mockReturnValue(authMock);
  });

  it("shows empty copy when player has no approved Open Play booking", () => {
    renderWithProviders(<OpenPlayPage />, { route: "/app/open-play" });
    expect(screen.getByText("No schedule for open play")).toBeInTheDocument();
  });

  it("shows empty copy when Open Play booking is still pending", () => {
    bookingsState.items = [
      {
        id: "bk-1",
        plan: "open-play",
        date: "2026-10-05",
        slotIds: ["07:00"],
        status: "pending",
      },
    ];
    renderWithProviders(<OpenPlayPage />, { route: "/app/open-play" });
    expect(screen.getByText("No schedule for open play")).toBeInTheDocument();
  });
});
