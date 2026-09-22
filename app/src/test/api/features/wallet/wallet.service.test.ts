import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import api from "@/api/client";
import {
  createMeWalletTopUp,
  getMeWallet,
  getMeWalletTopUpReceiptUrl,
  listAdminWalletTopUps,
  patchAdminWalletTopUp,
} from "@/api/features/wallet/wallet.service";

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

const sampleTopUp = {
  id: "tu-1",
  amountCents: 10000,
  receiptKey: "receipts/a.jpg",
  receiptName: "gcash.jpg",
  receiptMimeType: "image/jpeg",
  status: "pending" as const,
  createdAt: "2026-09-01T12:00:00.000Z",
  updatedAt: "2026-09-01T12:00:00.000Z",
};

describe("wallet.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets wallet from GET /me/wallet", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { balanceCents: 0, topUps: [] },
    });

    const result = await getMeWallet();

    expect(mockedApi.get).toHaveBeenCalledWith("/me/wallet", {
      signal: undefined,
    });
    expect(result.balanceCents).toBe(0);
  });

  it("creates top-up via POST /me/wallet/top-ups", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: sampleTopUp });

    const result = await createMeWalletTopUp({
      amountCents: 10000,
      receiptKey: "receipts/a.jpg",
      receiptName: "gcash.jpg",
      receiptMimeType: "image/jpeg",
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/me/wallet/top-ups", {
      amountCents: 10000,
      receiptKey: "receipts/a.jpg",
      receiptName: "gcash.jpg",
      receiptMimeType: "image/jpeg",
    });
    expect(result.id).toBe("tu-1");
  });

  it("lists admin top-ups from GET /admin/wallet/top-ups", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        items: [
          {
            ...sampleTopUp,
            userId: "u1",
            userName: "Ada",
            userEmail: "ada@example.com",
          },
        ],
      },
    });

    const result = await listAdminWalletTopUps({ status: "pending" });

    expect(mockedApi.get).toHaveBeenCalledWith("/admin/wallet/top-ups", {
      params: { page: 1, limit: 20, status: "pending" },
      signal: undefined,
    });
    expect(result.items[0]?.userEmail).toBe("ada@example.com");
  });

  it("patches admin top-up status", async () => {
    mockedApi.patch.mockResolvedValueOnce({
      data: {
        ...sampleTopUp,
        status: "approved",
        userId: "u1",
        userName: "Ada",
        userEmail: "ada@example.com",
      },
    });

    const result = await patchAdminWalletTopUp("tu-1", { status: "approved" });

    expect(mockedApi.patch).toHaveBeenCalledWith("/admin/wallet/top-ups/tu-1", {
      status: "approved",
    });
    expect(result.status).toBe("approved");
  });

  it("gets player top-up receipt URL from GET /me/wallet/top-ups/:id/receipt-url", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        url: "https://cdn.example/topup.jpg",
        expiresAt: "2026-09-01T13:00:00.000Z",
      },
    });

    const result = await getMeWalletTopUpReceiptUrl("tu-1");

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/me/wallet/top-ups/tu-1/receipt-url",
      { signal: undefined },
    );
    expect(result.url).toBe("https://cdn.example/topup.jpg");
  });
});
