import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminWalletTopUpsPage } from "@/pages/admin/wallet/AdminWalletTopUpsPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/wallet/use-wallet", () => ({
  useAdminWalletTopUps: () => ({
    data: {
      items: [
        {
          id: "tu-1",
          amountCents: 10000,
          receiptKey: "receipts/a.jpg",
          receiptName: "gcash.jpg",
          receiptMimeType: "image/jpeg",
          status: "pending",
          createdAt: "2026-09-01T12:00:00.000Z",
          updatedAt: "2026-09-01T12:00:00.000Z",
          userId: "u1",
          userName: "Ada Lovelace",
          userEmail: "ada@example.com",
        },
      ],
    },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  }),
  usePatchAdminWalletTopUp: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("AdminWalletTopUpsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Top-ups inbox heading and player row", () => {
    renderWithProviders(<AdminWalletTopUpsPage />, {
      route: "/admin/top-ups",
    });

    expect(
      screen.getByRole("heading", { name: /top-ups/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });
});
