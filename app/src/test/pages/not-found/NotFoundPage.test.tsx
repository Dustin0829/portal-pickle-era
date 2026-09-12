import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "@/pages/not-found/NotFoundPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("NotFoundPage", () => {
  it("renders for unknown routes", () => {
    renderWithProviders(<NotFoundPage />);
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
