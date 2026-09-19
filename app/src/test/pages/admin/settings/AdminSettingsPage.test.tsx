import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminSettingsPage } from "@/pages/admin/settings/AdminSettingsPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/pages/admin/settings/FoodMenuSettingsSection", () => ({
  FoodMenuSettingsSection: () => <div>Food menu panel</div>,
}));

describe("AdminSettingsPage tabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("switches between Prices and Food menu tabs", () => {
    renderWithProviders(<AdminSettingsPage />);

    expect(
      screen.getByRole("heading", { name: /^plan prices$/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Food menu panel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /food menu/i }));
    expect(screen.getByText("Food menu panel")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^plan prices$/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /open play sessions/i }));
    expect(screen.getByText(/set session start/i)).toBeInTheDocument();
  });
});
