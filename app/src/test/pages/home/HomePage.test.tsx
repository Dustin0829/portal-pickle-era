import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/pages/home/HomePage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("HomePage", () => {
  it("renders Pickle Era marketing landmarks", () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /welcome to\s+your\s+pickle era/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: /be first in/i }),
    ).toBeInTheDocument();
  });
});
