import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WalkInBookingModal } from "@/components/portal/WalkInBookingModal";
import { listBookings } from "@/lib/booking/booking";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

describe("WalkInBookingModal", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("saves an approved booking using calendar defaults", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const onClose = vi.fn();

    renderWithProviders(
      <WalkInBookingModal
        initial={{
          plan: "court",
          date: "2026-09-14",
          courtId: "in-1",
          slotIds: ["08:00"],
        }}
        onClose={onClose}
        onCreated={onCreated}
      />,
    );

    await user.type(screen.getByPlaceholderText("Full name"), "Kai Mendoza");
    await user.click(screen.getByRole("button", { name: /create booking/i }));

    expect(screen.queryByText(/select hours/i)).not.toBeInTheDocument();
    expect(onCreated).toHaveBeenCalledTimes(1);
    const saved = listBookings().find((item) => item.name === "Kai Mendoza");
    expect(saved).toMatchObject({
      date: "2026-09-14",
      courtId: "in-1",
      slotIds: ["08:00"],
      status: "approved",
      referenceId: "WALK-IN",
      receiptName: "Walk-in / cash",
    });
  });
});
