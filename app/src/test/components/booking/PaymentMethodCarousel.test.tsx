import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PaymentMethodCarousel } from "@/components/booking/PaymentMethodCarousel";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";
import type { FacilityPaymentMethod } from "@/lib/booking/paymentMethods";

const methods: FacilityPaymentMethod[] = [
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
];

describe("PaymentMethodCarousel", () => {
  afterEach(() => {
    cleanup();
  });

  it("cycles to the next method and wraps on Previous from first", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PaymentMethodCarousel methods={methods} variant="light" />,
    );

    expect(screen.getByText("GCash")).toBeInTheDocument();
    expect(screen.getByText("Pickle Era GCash")).toBeInTheDocument();
    expect(screen.getByText("09170000001")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /next payment method/i }),
    );

    expect(screen.getByText("Maya")).toBeInTheDocument();
    expect(screen.getByText("Pickle Era Maya")).toBeInTheDocument();
    expect(screen.getByText("09170000002")).toBeInTheDocument();
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /previous payment method/i }),
    );
    expect(screen.getByText("GCash")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /previous payment method/i }),
    );
    expect(screen.getByText("Maya")).toBeInTheDocument();
  });

  it("hides Previous/Next when only one method exists", () => {
    renderWithProviders(
      <PaymentMethodCarousel methods={[methods[0]!]} variant="light" />,
    );

    expect(
      screen.queryByRole("button", { name: /next payment method/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /previous payment method/i }),
    ).not.toBeInTheDocument();
  });
});
