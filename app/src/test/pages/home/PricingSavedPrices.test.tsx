import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Pricing } from "@/pages/home/Pricing";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";
import {
  clearFacilitySettingsCache,
  seedFacilitySettings,
} from "@/test/helpers/facilitySettings";

vi.mock("@/api/features/facility-settings/facility-settings.service", () => ({
  getFacilitySettings: vi.fn(async () =>
    seedFacilitySettings({
      planPrices: { court: 420, openPlay: 175, clinic: 500 },
    }),
  ),
  patchFacilitySettings: vi.fn(),
}));

describe("Pricing saved prices", () => {
  afterEach(() => {
    cleanup();
    clearFacilitySettingsCache();
  });

  beforeEach(() => {
    clearFacilitySettingsCache();
    seedFacilitySettings({
      planPrices: { court: 420, openPlay: 175, clinic: 500 },
    });
  });

  it("shows saved facility plan prices", () => {
    const settings = seedFacilitySettings({
      planPrices: { court: 420, openPlay: 175, clinic: 500 },
    });
    renderWithProviders(<Pricing />, { facilitySettings: settings });
    expect(screen.getByText("420")).toBeInTheDocument();
    expect(screen.getByText("175")).toBeInTheDocument();
  });

  it("has no clinic book card or CTA", () => {
    const settings = seedFacilitySettings({
      planPrices: { court: 420, openPlay: 175, clinic: 500 },
    });
    renderWithProviders(<Pricing />, { facilitySettings: settings });
    expect(screen.queryByText(/clinics & coaching/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /view clinics/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /book a court/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /join open play/i }),
    ).toBeInTheDocument();
  });
});
