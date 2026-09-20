import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PaymentMethodPicker } from "@/components/booking/PaymentMethodCarousel";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";
import type { FacilityPaymentMethod } from "@/lib/booking/paymentMethods";

const methods: FacilityPaymentMethod[] = [
  {
    id: "gcash",
    label: "GCash",
    name: "Pickle Era GCash",
    number: "09170000001",
    qrImageDataUrl: "data:image/png;base64,gcash",
  },
  {
    id: "maya",
    label: "Maya",
    name: "Pickle Era Maya",
    number: "09170000002",
    qrImageDataUrl: "data:image/png;base64,maya",
  },
];

describe("PaymentMethodPicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows method chooser before QR when two methods exist", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PaymentMethodPicker methods={methods} variant="light" />,
    );

    expect(screen.getByText(/select a payment method/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /qr code/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/scan to pay/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /next payment method/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^gcash$/i }));

    expect(
      screen.getByRole("img", { name: /gcash qr code/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pickle Era GCash")).toBeInTheDocument();
    expect(screen.getByText("09170000001")).toBeInTheDocument();
    expect(screen.queryByText("Maya")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /change method/i }));
    expect(screen.getByText(/select a payment method/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /qr code/i }),
    ).not.toBeInTheDocument();
  });

  it("auto-selects details when only one method exists", () => {
    renderWithProviders(
      <PaymentMethodPicker methods={[methods[0]!]} variant="light" />,
    );

    expect(
      screen.queryByText(/select a payment method/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /gcash qr code/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /change method/i }),
    ).not.toBeInTheDocument();
  });
});
