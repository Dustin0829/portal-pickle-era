import { describe, expect, it } from "vitest";
import {
  defaultPaymentMethods,
  resolvePaymentMethods,
} from "@/lib/booking/paymentMethods";

describe("resolvePaymentMethods", () => {
  it("prefers paymentMethods when present", () => {
    const methods = resolvePaymentMethods({
      paymentMethods: [
        {
          id: "maya-1",
          label: "Maya",
          name: "Pickle Era",
          number: "09171234567",
          qrImageDataUrl: "data:image/png;base64,abc",
        },
      ],
      payment: {
        method: "GCash",
        name: "Legacy",
        number: "09999999999",
      },
    });

    expect(methods).toHaveLength(1);
    expect(methods[0]).toMatchObject({
      id: "maya-1",
      label: "Maya",
      name: "Pickle Era",
      number: "09171234567",
      qrImageDataUrl: "data:image/png;base64,abc",
    });
  });

  it("migrates legacy payment into a single method", () => {
    const methods = resolvePaymentMethods({
      paymentMethods: [],
      payment: {
        method: "BDO",
        name: "Facility Acct",
        number: "1234 5678 9012",
      },
    });

    expect(methods).toEqual([
      {
        id: "migrated-payment",
        label: "BDO",
        name: "Facility Acct",
        number: "1234 5678 9012",
        qrImageDataUrl: null,
      },
    ]);
  });

  it("falls back to default GCash when nothing persisted", () => {
    expect(resolvePaymentMethods({})).toEqual(defaultPaymentMethods());
  });
});
