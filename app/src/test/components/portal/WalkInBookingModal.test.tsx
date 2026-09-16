import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WalkInBookingModal } from "@/components/portal/WalkInBookingModal";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const createAdminBooking = vi.fn();

vi.mock("@/api/features/bookings/bookings.service", () => ({
  createAdminBooking: (...args: unknown[]) => createAdminBooking(...args),
}));

describe("WalkInBookingModal", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    createAdminBooking.mockReset();
  });

  beforeEach(() => {
    localStorage.clear();
    createAdminBooking.mockResolvedValue({
      id: "b-walkin",
      plan: "court",
      date: "2026-09-14",
      courtId: "in-1",
      slotIds: ["08:00"],
      name: "Kai Mendoza",
      email: "walk-in@pickleera.local",
      userId: null,
      referenceId: "WALK-IN",
      receiptName: "Walk-in / cash",
      receiptKey: null,
      receiptMimeType: null,
      status: "approved",
      createdAt: "2026-09-14T00:00:00.000Z",
      updatedAt: "2026-09-14T00:00:00.000Z",
    });
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

    await waitFor(() => {
      expect(createAdminBooking).toHaveBeenCalledTimes(1);
    });
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(onCreated.mock.calls[0]?.[0]).toMatchObject({
      date: "2026-09-14",
      courtId: "in-1",
      slotIds: ["08:00"],
      status: "approved",
      referenceId: "WALK-IN",
      receiptName: "Walk-in / cash",
    });
  });
});
