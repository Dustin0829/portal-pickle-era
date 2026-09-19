import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminPlayersPage } from "@/pages/admin/waitlist/AdminWaitlistPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/waitlist/use-waitlist", () => ({
  useAdminWaitlistList: () => ({
    data: {
      items: [
        {
          id: "p1",
          name: "Ada",
          email: "ada@example.com",
          phone: null,
          source: "newsletter",
          imageUrl: "https://cdn.example.com/ada.png",
          createdAt: "2026-09-01T12:00:00.000Z",
          updatedAt: "2026-09-01T12:00:00.000Z",
        },
        {
          id: "p2",
          name: "Ben",
          email: "ben@example.com",
          phone: null,
          source: "booking",
          imageUrl: null,
          createdAt: "2026-09-10T12:00:00.000Z",
          updatedAt: "2026-09-10T12:00:00.000Z",
        },
      ],
    },
    isPending: false,
    isError: false,
    error: null,
    isFetching: false,
  }),
}));

describe("AdminPlayersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Players heading and source badges", () => {
    renderWithProviders(<AdminPlayersPage />, { route: "/admin/players" });

    expect(
      screen.getByRole("heading", { name: /^players$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Newsletter")).toBeInTheDocument();
    expect(screen.getByText("Booking")).toBeInTheDocument();
  });

  it("renders profile image when imageUrl is present", () => {
    const { container } = renderWithProviders(<AdminPlayersPage />, {
      route: "/admin/players",
    });

    const img = container.querySelector(
      'img[src="https://cdn.example.com/ada.png"]',
    );
    expect(img).toBeTruthy();
  });
});
