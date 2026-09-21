import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import App from "@/App";
import { AdminPortalLayout } from "@/layouts/AdminPortalLayout";
import { StudentPortalLayout } from "@/layouts/StudentPortalLayout";
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
  refreshUser: vi.fn(),
  patchMe: vi.fn(),
}));

vi.mock("@/api/features/bookings/use-bookings", () => ({
  useMyBookings: () => ({ data: [], isPending: false, isError: false }),
  useAdminBookings: () => ({
    data: { items: [] },
    isPending: false,
    isError: false,
  }),
  useOccupancy: () => ({ data: [], isPending: false }),
}));

vi.mock("@/api/features/waitlist/use-waitlist", () => ({
  useAdminWaitlistList: () => ({
    data: { items: [] },
    isPending: false,
    isError: false,
  }),
  adminWaitlistQueryKey: ["admin-waitlist"],
}));

const useMyFoodOrders = vi.fn(() => ({
  data: [],
  isPending: false,
  isError: false,
}));
const useAdminFoodOrders = vi.fn(() => ({
  data: { items: [] },
  isPending: false,
  isError: false,
}));

vi.mock("@/api/features/food/use-food", () => ({
  useMyFoodOrders: (...args: unknown[]) => useMyFoodOrders(...args),
  useAdminFoodOrders: (...args: unknown[]) => useAdminFoodOrders(...args),
  useMyFoodMenu: () => ({ data: [], isPending: false, isError: false }),
  useCreateMyFoodOrder: () => ({ mutate: vi.fn(), isPending: false }),
  meFoodOrdersQueryKey: ["me-food-orders"],
  adminFoodOrdersQueryKey: ["admin-food-orders"],
}));

function mockUser(role: "student" | "admin") {
  const user = {
    id: "u1",
    name: role === "admin" ? "Facility Admin" : "Player One",
    email: role === "admin" ? "admin@pickleera.local" : "player@example.com",
    role,
  };
  localStorage.setItem("pickle-era-session", JSON.stringify(user));
  vi.spyOn(AuthProvider, "useAuth").mockReturnValue({
    user,
    status: "authenticated",
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    resetPassword: vi.fn(),
  });
}

describe("Food hidden while paused", () => {
  beforeEach(() => {
    localStorage.clear();
    useMyFoodOrders.mockClear();
    useAdminFoodOrders.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("omits Food from the player portal nav", () => {
    mockUser("student");

    renderWithProviders(
      <Routes>
        <Route path="/app" element={<StudentPortalLayout />}>
          <Route index element={<div>Overview</div>} />
        </Route>
      </Routes>,
      { route: "/app" },
    );

    expect(screen.queryByRole("link", { name: /food/i })).toBeNull();
    expect(
      screen.getByRole("link", { name: /my bookings/i }),
    ).toBeInTheDocument();
  });

  it("omits Food from the admin portal nav", () => {
    mockUser("admin");

    renderWithProviders(
      <Routes>
        <Route path="/admin" element={<AdminPortalLayout />}>
          <Route index element={<div>Dashboard</div>} />
        </Route>
      </Routes>,
      { route: "/admin" },
    );

    expect(screen.queryByRole("link", { name: /food/i })).toBeNull();
    expect(screen.getByRole("link", { name: /top-ups/i })).toBeInTheDocument();
  });

  it("redirects /app/food to the player overview", async () => {
    mockUser("student");

    renderWithProviders(<App />, { route: "/app/food" });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /hi, player/i }),
      ).toBeInTheDocument();
    });
  });

  it("redirects /admin/food to the admin dashboard", async () => {
    mockUser("admin");

    renderWithProviders(<App />, { route: "/admin/food" });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /admin dashboard/i }),
      ).toBeInTheDocument();
    });
  });

  it("does not fetch food orders on overview or dashboard", async () => {
    mockUser("admin");

    renderWithProviders(<App />, { route: "/admin" });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /admin dashboard/i }),
      ).toBeInTheDocument();
    });
    expect(useAdminFoodOrders).toHaveBeenCalledWith(expect.anything(), false);
  });
});
