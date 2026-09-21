import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WalletPage } from "@/pages/app/wallet/WalletPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";
import {
  clearFacilitySettingsCache,
  seedFacilitySettings,
} from "@/test/helpers/facilitySettings";

const historyState = vi.hoisted(() => ({
  items: [] as Array<{
    id: string;
    amountCents: number;
    balanceAfterCents: number;
    type: "top_up" | "booking_debit" | "booking_refund" | "food_debit";
    referenceType: string | null;
    referenceId: string | null;
    createdAt: string;
  }>,
}));

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
  useMeWalletTransactions: () => ({
    data: { items: historyState.items },
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

vi.mock("@/api/features/facility-settings/facility-settings.service", () => ({
  getFacilitySettings: vi.fn(async () =>
    seedFacilitySettings({
      paymentMethods: [
        {
          id: "gcash",
          label: "GCash",
          name: "Pickle Era GCash",
          number: "09170000001",
          qrImageKey: null,
          qrImageUrl: null,
          sortOrder: 0,
        },
        {
          id: "maya",
          label: "Maya",
          name: "Pickle Era Maya",
          number: "09170000002",
          qrImageKey: null,
          qrImageUrl: null,
          sortOrder: 1,
        },
      ],
    }),
  ),
  patchFacilitySettings: vi.fn(),
}));

describe("WalletPage", () => {
  afterEach(() => {
    cleanup();
    clearFacilitySettingsCache();
    historyState.items = [];
  });

  beforeEach(() => {
    vi.clearAllMocks();
    clearFacilitySettingsCache();
    historyState.items = [];
    seedFacilitySettings({
      paymentMethods: [
        {
          id: "gcash",
          label: "GCash",
          name: "Pickle Era GCash",
          number: "09170000001",
          qrImageKey: null,
          qrImageUrl: null,
          sortOrder: 0,
        },
        {
          id: "maya",
          label: "Maya",
          name: "Pickle Era Maya",
          number: "09170000002",
          qrImageKey: null,
          qrImageUrl: null,
          sortOrder: 1,
        },
      ],
    });
  });

  it("defaults to Wallet tab with balance and top-up", () => {
    renderWithProviders(<WalletPage />, { route: "/app/wallet" });

    expect(
      screen.getByRole("heading", { name: /^wallet$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /^wallet$/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getAllByText(/₱250/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/^pending$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^top up$/i }),
    ).toBeInTheDocument();
  });

  it("switches to Transaction history empty state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WalletPage />, { route: "/app/wallet" });

    await user.click(screen.getByRole("tab", { name: /transaction history/i }));

    expect(
      screen.getByRole("tab", { name: /transaction history/i }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/no wallet activity yet/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^top up$/i }),
    ).not.toBeInTheDocument();
  });

  it("renders credit and debit history rows", async () => {
    historyState.items = [
      {
        id: "le-1",
        amountCents: 50_000,
        balanceAfterCents: 50_000,
        type: "top_up",
        referenceType: "wallet_top_up",
        referenceId: "tu-1",
        createdAt: "2026-09-21T10:00:00.000Z",
      },
      {
        id: "le-2",
        amountCents: -30_000,
        balanceAfterCents: 20_000,
        type: "booking_debit",
        referenceType: "booking",
        referenceId: "b-1",
        createdAt: "2026-09-21T11:00:00.000Z",
      },
    ];
    const user = userEvent.setup();
    renderWithProviders(<WalletPage />, { route: "/app/wallet" });

    await user.click(screen.getByRole("tab", { name: /transaction history/i }));

    expect(screen.getByText(/top-up credit/i)).toBeInTheDocument();
    expect(screen.getByText(/booking credit hold/i)).toBeInTheDocument();
    expect(screen.getByText(/\+₱500/)).toBeInTheDocument();
    expect(screen.getByText(/−₱300/)).toBeInTheDocument();
  });

  it("selects a facility payment method before showing QR details", async () => {
    const user = userEvent.setup();
    const settings = seedFacilitySettings({
      paymentMethods: [
        {
          id: "gcash",
          label: "GCash",
          name: "Pickle Era GCash",
          number: "09170000001",
          qrImageKey: null,
          qrImageUrl: null,
          sortOrder: 0,
        },
        {
          id: "maya",
          label: "Maya",
          name: "Pickle Era Maya",
          number: "09170000002",
          qrImageKey: null,
          qrImageUrl: null,
          sortOrder: 1,
        },
      ],
    });
    renderWithProviders(<WalletPage />, {
      route: "/app/wallet",
      facilitySettings: settings,
    });

    await waitFor(() => {
      expect(screen.getByText(/select a payment method/i)).toBeInTheDocument();
    });
    expect(screen.queryByText("Pickle Era GCash")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^gcash$/i }));

    expect(screen.getByText("Pickle Era GCash")).toBeInTheDocument();
    expect(screen.getByText("09170000001")).toBeInTheDocument();
  });
});
