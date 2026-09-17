import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Pricing } from "@/pages/home/Pricing";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("Pricing saved prices", () => {
  beforeEach(() => {
    useFacilitySettingsStore.getState().resetDefaults();
    useFacilitySettingsStore.getState().setPlanPrice("court", 420);
    useFacilitySettingsStore.getState().setPlanPrice("open-play", 175);
    useFacilitySettingsStore.getState().setPlanPrice("clinic", 550);
  });

  it("shows saved facility plan prices", () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText("420")).toBeInTheDocument();
    expect(screen.getByText("175")).toBeInTheDocument();
    expect(screen.getByText("550")).toBeInTheDocument();
  });
});
