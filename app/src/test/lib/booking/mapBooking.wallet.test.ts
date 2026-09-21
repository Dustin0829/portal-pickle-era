import { describe, expect, it } from "vitest";
import { bookingDtoToRequest } from "@/lib/booking/mapBooking";
import type { BookingDto } from "@/api/features/bookings/bookings.schema";

const baseDto: BookingDto = {
  id: "b1",
  plan: "court",
  date: "2026-10-05",
  courtId: "in-1",
  slotIds: ["06:00"],
  courtSlots: [{ courtId: "in-1", slotIds: ["06:00"] }],
  name: "Franz",
  email: "franz@example.com",
  userId: "u1",
  referenceId: "REF",
  receiptName: "receipt.jpg",
  receiptKey: "key",
  receiptMimeType: "image/jpeg",
  walletAppliedCents: 20_000,
  status: "approved",
  createdAt: "2026-09-21T00:00:00.000Z",
  updatedAt: "2026-09-21T00:00:00.000Z",
};

describe("bookingDtoToRequest wallet credits", () => {
  it("maps walletAppliedCents", () => {
    expect(bookingDtoToRequest(baseDto).walletAppliedCents).toBe(20_000);
  });
});
