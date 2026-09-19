import { describe, expect, it } from "vitest";
import {
  centsToPesos,
  formatCentsAsPesos,
  pesosToCents,
} from "@/lib/wallet/formatWalletMoney";
import {
  getAdminTopUpsListStatus,
  getWalletPageStatus,
} from "@/lib/wallet/walletListStatus";

describe("formatWalletMoney", () => {
  it("converts pesos to cents", () => {
    expect(pesosToCents(500)).toBe(50_000);
    expect(pesosToCents(1.5)).toBe(150);
  });

  it("converts cents to pesos", () => {
    expect(centsToPesos(50_000)).toBe(500);
  });

  it("formats cents as pesos", () => {
    expect(formatCentsAsPesos(15000)).toContain("150");
  });
});

describe("walletListStatus", () => {
  it("returns loading then ready for wallet page", () => {
    expect(
      getWalletPageStatus({
        isPending: true,
        isError: false,
        data: undefined,
      }),
    ).toBe("loading");
    expect(
      getWalletPageStatus({
        isPending: false,
        isError: false,
        data: { balanceCents: 0, topUps: [] },
      }),
    ).toBe("ready");
  });

  it("returns empty when admin list has no items", () => {
    expect(
      getAdminTopUpsListStatus({
        isPending: false,
        isError: false,
        items: [],
      }),
    ).toBe("empty");
  });
});
