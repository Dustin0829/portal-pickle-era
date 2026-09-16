import type {
  BookingDto,
  BookingOccupancyItem,
} from "@/api/features/bookings/bookings.schema";
import type { BookingRequest } from "@/lib/booking/booking";

/** Map API booking DTO into the UI BookingRequest shape. */
export function bookingDtoToRequest(dto: BookingDto): BookingRequest {
  return {
    id: dto.id,
    plan: dto.plan,
    date: dto.date,
    courtId: dto.courtId,
    slotId: dto.slotIds[0],
    slotIds: dto.slotIds,
    name: dto.name,
    email: dto.email,
    referenceId: dto.referenceId,
    receiptName: dto.receiptName ?? "",
    receiptDataUrl: dto.receiptKey?.startsWith("http")
      ? dto.receiptKey
      : undefined,
    receiptMimeType: dto.receiptMimeType ?? undefined,
    status: dto.status,
    createdAt: dto.createdAt,
  };
}

export function occupancyToBookingRequest(
  item: BookingOccupancyItem,
): BookingRequest {
  return {
    id: item.id,
    plan: item.plan,
    date: item.date,
    courtId: item.courtId,
    slotId: item.slotIds[0],
    slotIds: item.slotIds,
    name: "",
    email: "",
    referenceId: "",
    receiptName: "",
    status: item.status,
    createdAt: "",
  };
}
