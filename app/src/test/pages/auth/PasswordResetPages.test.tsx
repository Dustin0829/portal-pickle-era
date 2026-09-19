import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordPage } from "@/pages/forgot-password/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/reset-password/ResetPasswordPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const forgotPassword = vi.fn();
const resetPassword = vi.fn();

vi.mock("@/api/features/auth/auth.service", () => ({
  getMe: vi.fn(async () => {
    const err = new Error("Unauthorized") as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }),
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  patchMe: vi.fn(),
  forgotPassword: (...args: unknown[]) => forgotPassword(...args),
  resetPassword: (...args: unknown[]) => resetPassword(...args),
}));

describe("forgot / reset password pages", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    forgotPassword.mockResolvedValue(undefined);
    resetPassword.mockResolvedValue(undefined);
  });

  it("shows enumeration-safe success after forgot submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, {
      route: "/forgot-password",
    });

    await user.type(screen.getByLabelText(/^email$/i), "player@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith({
        email: "player@example.com",
      });
    });

    expect(screen.getByText(/if an account exists for/i)).toBeInTheDocument();
    expect(screen.getByText("player@example.com")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /reset password/i }),
    ).not.toBeInTheDocument();
  });

  it("shows missing-token error and does not call reset", async () => {
    renderWithProviders(<ResetPasswordPage />, {
      route: "/reset-password",
    });

    expect(screen.getByText(/missing a token/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save password/i }),
    ).toBeDisabled();
    expect(resetPassword).not.toHaveBeenCalled();
  });
});
