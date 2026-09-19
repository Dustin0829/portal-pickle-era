import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as AuthProvider from "@/providers/AuthProvider";
import { ProfilePage } from "@/pages/app/profile/ProfilePage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("ProfilePage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("hides seed banner and page logout", () => {
    vi.spyOn(AuthProvider, "useAuth").mockReturnValue({
      user: {
        id: "u1",
        name: "Ada",
        email: "ada@example.com",
        role: "student",
        imageUrl: null,
      },
      status: "authenticated",
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      resetPassword: vi.fn(),
    });

    renderWithProviders(<ProfilePage />);

    expect(screen.queryByText(/local seed accounts/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^log out$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /change password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /upload photo/i }),
    ).toBeInTheDocument();
  });
});
