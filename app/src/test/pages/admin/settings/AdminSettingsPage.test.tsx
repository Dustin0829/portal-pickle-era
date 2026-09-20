import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminSettingsPage } from "@/pages/admin/settings/AdminSettingsPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";
import {
  clearFacilitySettingsCache,
  seedFacilitySettings,
} from "@/test/helpers/facilitySettings";
import { fallbackFacilitySettings } from "@/lib/facility/facilitySettingsView";

vi.mock("@/pages/admin/settings/FoodMenuSettingsSection", () => ({
  FoodMenuSettingsSection: () => <div>Food menu panel</div>,
}));

vi.mock("@/api/features/facility-settings/facility-settings.service", () => ({
  getFacilitySettings: vi.fn(async () => seedFacilitySettings()),
  patchFacilitySettings: vi.fn(async () => seedFacilitySettings()),
}));

describe("AdminSettingsPage tabs", () => {
  afterEach(() => {
    cleanup();
    clearFacilitySettingsCache();
  });

  beforeEach(() => {
    clearFacilitySettingsCache();
    seedFacilitySettings();
  });

  it("switches between Prices and Food menu tabs", async () => {
    renderWithProviders(<AdminSettingsPage />, {
      facilitySettings: seedFacilitySettings(),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^plan prices$/i }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText("Food menu panel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /food menu/i }));
    expect(screen.getByText("Food menu panel")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^plan prices$/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /open play sessions/i }));
    expect(screen.getByText(/set session start/i)).toBeInTheDocument();
  });

  it("uses compact underline tab density", async () => {
    renderWithProviders(<AdminSettingsPage />, {
      facilitySettings: seedFacilitySettings(),
    });
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /^prices$/i }),
      ).toBeInTheDocument();
    });
    const tab = screen.getByRole("tab", { name: /^prices$/i });
    expect(tab.className).toContain("px-3");
    expect(tab.className).toContain("py-2");
    expect(tab.className).toContain("tracking-[0.14em]");
  });

  it("still shows defaults after clearing legacy localStorage key", async () => {
    localStorage.setItem(
      "pickle-era-facility-settings",
      JSON.stringify({ state: { plans: {} } }),
    );
    clearFacilitySettingsCache();
    seedFacilitySettings();
    renderWithProviders(<AdminSettingsPage />, {
      facilitySettings: seedFacilitySettings(),
    });
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^plan prices$/i }),
      ).toBeInTheDocument();
    });
    expect(localStorage.getItem("pickle-era-facility-settings")).toBeNull();
    expect(fallbackFacilitySettings().planPrices.court).toBe(300);
  });
});
