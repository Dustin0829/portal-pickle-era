import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WalkInBookingModal } from "@/components/portal/WalkInBookingModal";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

const createAdminBooking = vi.fn();
const listOpenPlaySessions = vi.fn();
const listOccupancy = vi.fn();

vi.mock("@/api/features/bookings/bookings.service", () => ({
  createAdminBooking: (...args: unknown[]) => createAdminBooking(...args),
  listOpenPlaySessions: (...args: unknown[]) => listOpenPlaySessions(...args),
  listOccupancy: (...args: unknown[]) => listOccupancy(...args),
}));

describe("WalkInBookingModal", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    createAdminBooking.mockReset();
    listOpenPlaySessions.mockReset();
    listOccupancy.mockReset();
    useFacilitySettingsStore.getState().resetDefaults();
  });

  beforeEach(() => {
    localStorage.clear();
    useFacilitySettingsStore.getState().resetDefaults();
    createAdminBooking.mockResolvedValue({
      id: "b-walkin",
      plan: "court",
      date: "2026-10-05",
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
      createdAt: "2026-10-05T00:00:00.000Z",
      updatedAt: "2026-10-05T00:00:00.000Z",
    });
    listOpenPlaySessions.mockResolvedValue([]);
    listOccupancy.mockResolvedValue([]);
  });

  it("saves an approved booking using calendar defaults", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const onClose = vi.fn();

    renderWithProviders(
      <WalkInBookingModal
        initial={{
          plan: "court",
          date: "2026-10-05",
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
      date: "2026-10-05",
      courtId: "in-1",
      slotIds: ["08:00"],
      status: "approved",
      referenceId: "WALK-IN",
      receiptName: "Walk-in / cash",
    });
  });

  it("shows X/30 and disables a full open-play session", async () => {
    listOpenPlaySessions.mockResolvedValue([
      { slotId: "07:00", bookedCount: 12, capacity: 30 },
      { slotId: "16:00", bookedCount: 30, capacity: 30 },
    ]);

    renderWithProviders(
      <WalkInBookingModal
        initial={{ plan: "open-play", date: "2026-10-05" }}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/12\/30/).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/full · 30\/30/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/clinics & coaching/i)).not.toBeInTheDocument();

    const fullSession = screen.getAllByRole("button", {
      name: /full · 30\/30/i,
    })[0];
    expect(fullSession).toBeDefined();
    expect(fullSession).toBeDisabled();
  });

  it("blocks open-play selection when capacity fetch fails", async () => {
    listOpenPlaySessions.mockRejectedValue(new Error("network"));

    renderWithProviders(
      <WalkInBookingModal
        initial={{ plan: "open-play", date: "2026-10-05" }}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /couldn’t load session availability/i,
      );
    });

    const sessions = screen.getAllByRole("button", { name: /open play/i });
    expect(sessions.some((el) => (el as HTMLButtonElement).disabled)).toBe(
      true,
    );
  });
});
