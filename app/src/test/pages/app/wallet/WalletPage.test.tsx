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

const walletTopUpsState = vi.hoisted(() => ({
  items: [
    {
      id: "tu-1",
      amountCents: 25000,
      receiptKey: "receipts/a.jpg" as string | null,
      receiptName: "gcash.jpg" as string | null,
      receiptMimeType: "image/jpeg" as string | null,
      status: "pending" as const,
      createdAt: "2026-09-01T12:00:00.000Z",
      updatedAt: "2026-09-01T12:00:00.000Z",
    },
  ],
}));

const getMeWalletTopUpReceiptUrl = vi.fn();

vi.mock("@/api/features/wallet/wallet.service", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/api/features/wallet/wallet.service")
    >();
  return {
    ...actual,
    getMeWalletTopUpReceiptUrl: (...args: unknown[]) =>
      getMeWalletTopUpReceiptUrl(...args),
  };
});

vi.mock("@/api/features/wallet/use-wallet", () => ({
  useMeWallet: () => ({
    data: {
      balanceCents: 25000,
      topUps: walletTopUpsState.items,
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
    walletTopUpsState.items = [
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
    ];
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getMeWalletTopUpReceiptUrl.mockReset();
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

  it("previews top-up receipt image when receiptKey is present", async () => {
    const user = userEvent.setup();
    getMeWalletTopUpReceiptUrl.mockResolvedValue({
      url: "https://cdn.example/topup.jpg",
      expiresAt: "2026-09-01T13:00:00.000Z",
    });

    renderWithProviders(<WalletPage />, { route: "/app/wallet" });

    await user.click(screen.getByRole("button", { name: /₱250/i }));

    await waitFor(() => {
      expect(getMeWalletTopUpReceiptUrl).toHaveBeenCalledWith(
        "tu-1",
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(
        screen.getByRole("img", { name: /payment receipt|gcash/i }),
      ).toHaveAttribute("src", "https://cdn.example/topup.jpg");
    });
  });

  it("shows filename-only copy when top-up has no receiptKey", async () => {
    const user = userEvent.setup();
    walletTopUpsState.items = [
      {
        id: "tu-legacy",
        amountCents: 10000,
        receiptKey: null,
        receiptName: "old-name.jpg",
        receiptMimeType: null,
        status: "pending",
        createdAt: "2026-09-01T12:00:00.000Z",
        updatedAt: "2026-09-01T12:00:00.000Z",
      },
    ];

    renderWithProviders(<WalletPage />, { route: "/app/wallet" });

    await user.click(screen.getByRole("button", { name: /₱100/i }));

    expect(getMeWalletTopUpReceiptUrl).not.toHaveBeenCalled();
    expect(screen.getAllByText(/old-name\.jpg/i).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getByText(/only the filename was saved/i),
    ).toBeInTheDocument();
  });
});
