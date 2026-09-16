import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { OverviewPage } from "@/pages/app/overview/OverviewPage";
import { AdminBookingsPage } from "@/pages/admin/bookings/AdminBookingsPage";
import * as AuthProvider from "@/providers/AuthProvider";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/auth/auth.service", () => ({
  getMe: vi.fn(async () => {
    const raw = localStorage.getItem("pickle-era-session");
    if (!raw) {
      const err = new Error("Unauthorized") as Error & { statusCode: number };
      err.statusCode = 401;
      throw err;
    }
    return JSON.parse(raw) as {
      id: string;
      name: string;
      email: string;
      role: "student" | "admin";
    };
  }),
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  patchMe: vi.fn(),
}));

vi.mock("@/api/features/bookings/use-bookings", () => ({
  useMyBookings: () => ({ data: [], isLoading: false }),
  useAdminBookings: () => ({
    data: { items: [] },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useAdminUsers: () => ({ data: { items: [] }, isLoading: false }),
  useOccupancy: () => ({ data: [], isLoading: false }),
  usePatchAdminBooking: () => ({ mutateAsync: vi.fn() }),
  useCreateAdminBooking: () => ({ mutateAsync: vi.fn() }),
  useCreatePublicBooking: () => ({ mutateAsync: vi.fn() }),
  myBookingsQueryKey: ["me-bookings"],
  occupancyQueryKey: ["bookings-occupancy"],
  adminBookingsQueryKey: ["admin-bookings"],
  adminUsersQueryKey: ["admin-users"],
}));

function seedSession(role: "student" | "admin") {
  localStorage.setItem(
    "pickle-era-session",
    JSON.stringify({
      id: "test-user",
      name: role === "admin" ? "Facility Admin" : "Test Student",
      email: role === "admin" ? "admin@pickleera.local" : "student@example.com",
      role,
    }),
  );
}

describe("portal access gates", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("shows loading shell while auth status is loading", () => {
    vi.spyOn(AuthProvider, "useAuth").mockReturnValue({
      user: null,
      status: "loading",
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
    });

    renderWithProviders(
      <ProtectedRoute>
        <p>Secret portal</p>
      </ProtectedRoute>,
    );

    expect(screen.getByLabelText(/checking session/i)).toBeInTheDocument();
    expect(screen.queryByText("Secret portal")).not.toBeInTheDocument();
  });

  it("redirects signed-out visitors from /app to login", async () => {
    renderWithProviders(<App />, { route: "/app" });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /log in/i }),
      ).toBeInTheDocument();
    });
  });

  it("blocks non-admin users from /admin", async () => {
    seedSession("student");
    renderWithProviders(<App />, { route: "/admin" });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /admin access required/i }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText(/bookings inbox/i)).not.toBeInTheDocument();
  });

  it("shows player overview for signed-in players on /app", async () => {
    seedSession("student");
    renderWithProviders(<App />, { route: "/app" });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /hi, test/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("heading", { name: /coming soon/i }),
    ).not.toBeInTheDocument();
  });
});

describe("portal smoke", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("renders login form on /login", async () => {
    renderWithProviders(<App />, { route: "/login" });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /log in/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("renders player overview empty state when mounted directly", async () => {
    seedSession("student");
    vi.spyOn(AuthProvider, "useAuth").mockReturnValue({
      user: {
        id: "test-user",
        name: "Test Student",
        email: "student@example.com",
        role: "student",
      },
      status: "authenticated",
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
    });
    renderWithProviders(<OverviewPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /hi, test/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/you don’t have any booking requests yet/i),
    ).toBeInTheDocument();
  });

  it("renders admin bookings inbox empty state", async () => {
    seedSession("admin");
    renderWithProviders(<AdminBookingsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /bookings inbox/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/no pending booking requests/i),
    ).toBeInTheDocument();
  });
});
