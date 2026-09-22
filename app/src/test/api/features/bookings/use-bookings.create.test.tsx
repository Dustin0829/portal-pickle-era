import { describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { createPublicBooking } from "@/api/features/bookings/bookings.service";
import {
  adminBookingsQueryKey,
  myBookingsQueryKey,
  occupancyQueryKey,
  useCreatePublicBooking,
} from "@/api/features/bookings/use-bookings";
import { renderWithProviders } from "@/test/helpers/renderWithProviders";

vi.mock("@/api/features/bookings/bookings.service", () => ({
  createPublicBooking: vi.fn(),
  listMyBookings: vi.fn(),
  listOccupancy: vi.fn(),
  listAdminBookings: vi.fn(),
  listAdminUsers: vi.fn(),
  createAdminBooking: vi.fn(),
  patchAdminBooking: vi.fn(),
}));

function Probe({
  onReady,
}: {
  onReady: (mutate: ReturnType<typeof useCreatePublicBooking>) => void;
}) {
  const mutation = useCreatePublicBooking();
  onReady(mutation);
  return null;
}

describe("useCreatePublicBooking", () => {
  it("invalidates my bookings, occupancy, and admin bookings on success", async () => {
    vi.mocked(createPublicBooking).mockResolvedValue({
      id: "bk-new",
      plan: "court",
      date: "2026-10-05",
      courtId: "in-1",
      slotIds: ["08:00"],
      courtSlots: [{ courtId: "in-1", slotIds: ["08:00"] }],
      name: "Ada",
      email: "ada@example.com",
      userId: "u1",
      referenceId: "REF",
      receiptName: "proof.jpg",
      receiptKey: "receipts/proof.jpg",
      receiptMimeType: "image/jpeg",
      walletAppliedCents: 0,
      status: "pending",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    });

    let mutation: ReturnType<typeof useCreatePublicBooking> | undefined;
    const { qc } = renderWithProviders(
      <Probe
        onReady={(value) => {
          mutation = value;
        }}
      />,
    );
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    await mutation!.mutateAsync({
      plan: "court",
      date: "2026-10-05",
      courtId: "in-1",
      slotIds: ["08:00"],
      name: "Ada",
      email: "ada@example.com",
      referenceId: "REF",
      receiptName: "proof.jpg",
      receiptKey: "receipts/proof.jpg",
      receiptMimeType: "image/jpeg",
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: myBookingsQueryKey,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: occupancyQueryKey,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: adminBookingsQueryKey,
      });
    });
  });
});
