import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { OverviewPage } from "@/pages/app/overview/OverviewPage";
import { AdminBookingsPage } from "@/pages/admin/bookings/AdminBookingsPage";
import * as AuthProvider from "@/providers/AuthProvider";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

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
    expect(screen.queryByText(/player portal/i)).not.toBeInTheDocument();
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

  it("renders player portal for signed-in players", async () => {
    seedSession("student");
    renderWithProviders(<App />, { route: "/app" });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /hi, test/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/player portal/i)).toBeInTheDocument();
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

  it("renders player overview empty state", async () => {
    seedSession("student");
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
