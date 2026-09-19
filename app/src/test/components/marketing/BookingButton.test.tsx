import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BookingButton } from "@/components/marketing/BookingButton";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("BookingButton", () => {
  it("defaults label to Book a court and opens booking modal on opening month", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingButton />);

    const button = screen.getByRole("button", { name: /book a court/i });
    await user.click(button);

    expect(screen.getByText(/select date & time/i)).toBeInTheDocument();
    expect(screen.getByText(/private court/i)).toBeInTheDocument();
  });

  it("renders children label when provided", () => {
    renderWithProviders(<BookingButton>Reserve now</BookingButton>);
    expect(
      screen.getByRole("button", { name: /reserve now/i }),
    ).toBeInTheDocument();
  });
});
