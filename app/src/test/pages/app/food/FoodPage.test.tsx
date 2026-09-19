import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FoodPage } from "@/pages/app/food/FoodPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/food/use-food", () => ({
  useMyFoodMenu: () => ({
    data: [
      {
        id: "m1",
        name: "Iced Tea",
        priceCents: 5000,
        imageUrl: null,
        available: true,
      },
    ],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateMyFoodOrder: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe("FoodPage POS layout", () => {
  afterEach(() => {
    cleanup();
  });

  it("adds item to sidebar and disables place when empty then enables after add", () => {
    renderWithProviders(<FoodPage />);

    const place = screen.getByRole("button", { name: /place order/i });
    expect(place).toBeDisabled();
    expect(screen.getByText(/no items yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /\+ add/i }));
    expect(screen.getByText(/1× iced tea/i)).toBeInTheDocument();
    expect(place).not.toBeDisabled();
  });
});
