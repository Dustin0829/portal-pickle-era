import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as AuthProvider from "@/providers/AuthProvider";
import { OpenPlayPage } from "@/pages/app/open-play/OpenPlayPage";
import type { OpenPlayLiveBoard } from "@/api/features/open-play-live/open-play-live.schema";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const bookingsState = vi.hoisted(() => ({
  items: [] as Array<Record<string, unknown>>,
}));

const liveState = vi.hoisted(() => ({
  board: undefined as unknown,
  endGame: vi.fn(),
}));

vi.mock("@/api/features/bookings/use-bookings", () => ({
  useMyBookings: () => ({
    data: bookingsState.items,
    isPending: false,
    isError: false,
  }),
}));

vi.mock("@/api/features/open-play-live/use-open-play-live", () => ({
  useMeOpenPlayLiveBoard: () => ({
    data: liveState.board,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useEndMyOpenPlayLiveGame: () => ({
    mutate: liveState.endGame,
    isPending: false,
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

const approvedBooking = {
  id: "bk-1",
  plan: "open-play",
  date: "2026-10-05",
  slotIds: ["07:00"],
  status: "approved",
};

function playingBoard(): OpenPlayLiveBoard {
  return {
    session: {
      id: "s1",
      date: "2026-10-05",
      slotId: "07:00",
      status: "live",
    },
    courts: [
      {
        courtId: "in-1",
        courtLabel: "Court 1",
        state: "playing",
        game: {
          id: "g1",
          startedAt: new Date().toISOString(),
          players: [
            {
              participantId: "p1",
              name: "Ada",
              side: "A",
              seatIndex: 0,
            },
            { participantId: "p2", name: "Bo", side: "A", seatIndex: 1 },
            { participantId: "p3", name: "Cy", side: "B", seatIndex: 2 },
            { participantId: "p4", name: "Di", side: "B", seatIndex: 3 },
          ],
        },
      },
    ],
    upNext: [{ participantId: "p5", name: "Eve", position: 1 }],
    participants: [],
    checkedInCount: 5,
    capacity: 24,
    myStatus: {
      participantId: "p1",
      participantStatus: "checked_in",
      state: "playing",
      queuePosition: null,
      courtId: "in-1",
      courtLabel: "Court 1",
      side: "A",
      gameId: "g1",
    },
  };
}

describe("OpenPlayPage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    bookingsState.items = [];
    liveState.board = undefined;
    liveState.endGame = vi.fn();
    vi.spyOn(AuthProvider, "useAuth").mockReturnValue(authMock);
  });

  it("shows empty copy when player has no approved Open Play booking", () => {
    renderWithProviders(<OpenPlayPage />, { route: "/app/open-play" });
    expect(screen.getByText("No schedule for open play")).toBeInTheDocument();
  });

  it("shows empty copy when Open Play booking is still pending", () => {
    bookingsState.items = [{ ...approvedBooking, status: "pending" }];
    renderWithProviders(<OpenPlayPage />, { route: "/app/open-play" });
    expect(screen.getByText("No schedule for open play")).toBeInTheDocument();
  });

  it("shows the live status and court partners while playing", () => {
    bookingsState.items = [approvedBooking];
    liveState.board = playingBoard();
    renderWithProviders(<OpenPlayPage />, { route: "/app/open-play" });

    expect(screen.getByText("On Court 1 · Side A")).toBeInTheDocument();
    expect(screen.getByText("With Bo, Cy, Di")).toBeInTheDocument();
  });

  it("requires confirmation before ending a game", async () => {
    bookingsState.items = [approvedBooking];
    liveState.board = playingBoard();
    renderWithProviders(<OpenPlayPage />, { route: "/app/open-play" });

    await userEvent.click(screen.getByRole("button", { name: "End game" }));
    expect(liveState.endGame).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Confirm end game" }),
    );
    expect(liveState.endGame).toHaveBeenCalledWith("g1");
  });
});
