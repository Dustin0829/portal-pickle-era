import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FoodPage } from "@/pages/app/food/FoodPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const useMyFoodOrders = vi.fn(() => ({
  data: [] as unknown[],
  isPending: false,
  isError: false,
}));

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
  useMyFoodOrders: () => useMyFoodOrders(),
  useCreateMyFoodOrder: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe("FoodPage POS layout", () => {
  afterEach(() => {
    cleanup();
    useMyFoodOrders.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    });
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

  it("shows active placed orders with Preparing / Ready labels", () => {
    useMyFoodOrders.mockReturnValue({
      data: [
        {
          id: "o1",
          userId: "u1",
          status: "preparing",
          payMode: "counter",
          totalCents: 5000,
          notes: null,
          lines: [
            {
              id: "l1",
              menuItemId: "m1",
              name: "Iced Tea",
              unitPriceCents: 5000,
              quantity: 1,
            },
          ],
          createdAt: "2026-09-20T00:00:00.000Z",
          updatedAt: "2026-09-20T00:05:00.000Z",
        },
        {
          id: "o2",
          userId: "u1",
          status: "ready",
          payMode: "wallet",
          totalCents: 10000,
          notes: null,
          lines: [
            {
              id: "l2",
              menuItemId: "m1",
              name: "Iced Tea",
              unitPriceCents: 5000,
              quantity: 2,
            },
          ],
          createdAt: "2026-09-19T00:00:00.000Z",
          updatedAt: "2026-09-19T00:10:00.000Z",
        },
      ],
      isPending: false,
      isError: false,
    });

    renderWithProviders(<FoodPage />);

    expect(screen.getByText(/active orders/i)).toBeInTheDocument();
    expect(screen.getByText(/^preparing$/i)).toBeInTheDocument();
    expect(screen.getByText(/^ready$/i)).toBeInTheDocument();
  });
});
