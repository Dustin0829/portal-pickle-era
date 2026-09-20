import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WalkInBookingModal } from "@/components/portal/WalkInBookingModal";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";
import {
  clearFacilitySettingsCache,
  seedFacilitySettings,
} from "@/test/helpers/facilitySettings";

const createAdminBooking = vi.fn();
const listOpenPlaySessions = vi.fn();
const listOccupancy = vi.fn();

vi.mock("@/api/features/bookings/bookings.service", () => ({
  createAdminBooking: (...args: unknown[]) => createAdminBooking(...args),
  listOpenPlaySessions: (...args: unknown[]) => listOpenPlaySessions(...args),
  listOccupancy: (...args: unknown[]) => listOccupancy(...args),
}));

vi.mock("@/api/features/facility-settings/facility-settings.service", () => ({
  getFacilitySettings: vi.fn(async () => seedFacilitySettings()),
  patchFacilitySettings: vi.fn(),
}));

describe("WalkInBookingModal", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    createAdminBooking.mockReset();
    listOpenPlaySessions.mockReset();
    listOccupancy.mockReset();
    clearFacilitySettingsCache();
  });

  beforeEach(() => {
    localStorage.clear();
    clearFacilitySettingsCache();
    seedFacilitySettings();
    createAdminBooking.mockResolvedValue({
      id: "b-walkin",
      plan: "court",
      date: "2026-10-05",
      courtId: "in-1",
      slotIds: ["08:00"],
      courtSlots: [{ courtId: "in-1", slotIds: ["08:00"] }],
      name: "Kai Mendoza",
      email: "walk-in@pickleera.local",
      userId: null,
      referenceId: "WALK-IN",
      receiptName: "Walk-in / cash",
      receiptKey: null,
      receiptMimeType: null,
      walletAppliedCents: 0,
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
    expect(createAdminBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: "court",
        date: "2026-10-05",
        courtSlots: [{ courtId: "in-1", slotIds: ["08:00"] }],
        name: "Kai Mendoza",
      }),
    );
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
      expect(screen.getByText(/12\/30/)).toBeInTheDocument();
    });
    expect(screen.getByText(/full - 30\/30/i)).toBeInTheDocument();
    expect(screen.queryByText(/clinics & coaching/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/private court/i)).not.toBeInTheDocument();

    const fullSession = screen.getByRole("button", {
      name: /full - 30\/30/i,
    });
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
