import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WalletPage } from "@/pages/app/wallet/WalletPage";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/wallet/use-wallet", () => ({
  useMeWallet: () => ({
    data: {
      balanceCents: 25000,
      topUps: [
        {
          id: "tu-1",
          amountCents: 25000,
          receiptKey: "receipts/a.jpg",
          receiptName: "gcash.jpg",
          receiptMimeType: "image/jpeg",
          status: "pending",
          createdAt: "2026-09-01T12:00:00.000Z",
          updatedAt: "2026-09-01T12:00:00.000Z",
        },
      ],
    },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  }),
  useCreateMeWalletTopUp: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("WalletPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useFacilitySettingsStore.getState().setPaymentMethods([
      {
        id: "gcash",
        label: "GCash",
        name: "Pickle Era GCash",
        number: "09170000001",
        qrImageDataUrl: null,
      },
      {
        id: "maya",
        label: "Maya",
        name: "Pickle Era Maya",
        number: "09170000002",
        qrImageDataUrl: null,
      },
    ]);
  });

  it("shows Wallet heading, balance, and recent top-up", () => {
    renderWithProviders(<WalletPage />, { route: "/app/wallet" });

    expect(
      screen.getByRole("heading", { name: /^wallet$/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/₱250/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/^pending$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^top up$/i }),
    ).toBeInTheDocument();
  });

  it("cycles facility payment methods on top-up", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WalletPage />, { route: "/app/wallet" });

    expect(screen.getByText("Pickle Era GCash")).toBeInTheDocument();
    expect(screen.getByText("09170000001")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /next payment method/i }),
    );

    expect(screen.getByText("Pickle Era Maya")).toBeInTheDocument();
    expect(screen.getByText("09170000002")).toBeInTheDocument();
  });
});
