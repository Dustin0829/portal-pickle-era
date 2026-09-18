import { describe, expect, it } from "vitest";
import {
  createWalletTopUpBodySchema,
  createWalletTopUpFormSchema,
  meWalletDtoSchema,
  MAX_TOP_UP_CENTS,
} from "@/api/features/wallet/wallet.schema";

describe("wallet API schemas", () => {
  it("parses me wallet payload", () => {
    const parsed = meWalletDtoSchema.parse({
      balanceCents: 15000,
      topUps: [
        {
          id: "tu-1",
          amountCents: 50000,
          receiptKey: "receipts/a.jpg",
          receiptName: "gcash.jpg",
          receiptMimeType: "image/jpeg",
          status: "pending",
          createdAt: "2026-09-01T12:00:00.000Z",
          updatedAt: "2026-09-01T12:00:00.000Z",
        },
      ],
    });
    expect(parsed.balanceCents).toBe(15000);
    expect(parsed.topUps).toHaveLength(1);
  });

  it("rejects non-positive top-up amount", () => {
    expect(
      createWalletTopUpBodySchema.safeParse({
        amountCents: 0,
        receiptKey: "receipts/a.jpg",
      }).success,
    ).toBe(false);
  });

  it("rejects amount over max cents", () => {
    expect(
      createWalletTopUpBodySchema.safeParse({
        amountCents: MAX_TOP_UP_CENTS + 1,
        receiptKey: "receipts/a.jpg",
      }).success,
    ).toBe(false);
  });

  it("accepts pesos form within bounds", () => {
    const parsed = createWalletTopUpFormSchema.parse({ amountPesos: 500 });
    expect(parsed.amountPesos).toBe(500);
  });

  it("rejects pesos form over 50000", () => {
    expect(
      createWalletTopUpFormSchema.safeParse({ amountPesos: 50_001 }).success,
    ).toBe(false);
  });
});
