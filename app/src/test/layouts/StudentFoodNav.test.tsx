import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { StudentPortalLayout } from "@/layouts/StudentPortalLayout";
import * as AuthProvider from "@/providers/AuthProvider";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/auth/auth.service", () => ({
  getMe: vi.fn(async () => ({
    id: "u1",
    name: "Player",
    email: "player@example.com",
    role: "student" as const,
  })),
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
  patchMe: vi.fn(),
}));

describe("Student Food nav", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows Food in the player portal nav", () => {
    vi.spyOn(AuthProvider, "useAuth").mockReturnValue({
      user: {
        id: "u1",
        name: "Player",
        email: "player@example.com",
        role: "student",
      },
      status: "authenticated",
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      resetPassword: vi.fn(),
    });

    renderWithProviders(
      <Routes>
        <Route path="/app" element={<StudentPortalLayout />}>
          <Route index element={<div>Overview</div>} />
        </Route>
      </Routes>,
      { route: "/app" },
    );

    expect(screen.getByRole("link", { name: /food/i })).toHaveAttribute(
      "href",
      "/app/food",
    );
  });
});
