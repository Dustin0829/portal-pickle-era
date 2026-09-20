import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WalletPage } from "@/pages/app/wallet/WalletPage";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";
import {
  clearFacilitySettingsCache,
  seedFacilitySettings,
} from "@/test/helpers/facilitySettings";

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
  });

  beforeEach(() => {
    vi.clearAllMocks();
    clearFacilitySettingsCache();
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
