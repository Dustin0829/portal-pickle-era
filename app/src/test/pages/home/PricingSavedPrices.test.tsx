import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Pricing } from "@/pages/home/Pricing";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("Pricing saved prices", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useFacilitySettingsStore.getState().resetDefaults();
    useFacilitySettingsStore.getState().setPlanPrice("court", 420);
    useFacilitySettingsStore.getState().setPlanPrice("open-play", 175);
  });

  it("shows saved facility plan prices", () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText("420")).toBeInTheDocument();
    expect(screen.getByText("175")).toBeInTheDocument();
  });

  it("has no clinic book card or CTA", () => {
    renderWithProviders(<Pricing />);
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
