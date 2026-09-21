import {
  formatHour,
  type BookingPlan,
  type CourtSlotSegment,
} from "@/lib/booking/booking";

function formatSlotTime(slotId: string) {
  const hour = Number(slotId.slice(0, 2));
  if (Number.isNaN(hour)) return slotId;
  return formatHour(hour);
}

function slotIdsForRange(booking: {
  plan: BookingPlan;
  slotIds: string[];
  courtSlots?: CourtSlotSegment[];
}): string[] {
  if (booking.plan === "court" && booking.courtSlots?.length) {
    return booking.courtSlots.flatMap((segment) => segment.slotIds);
  }
  return booking.slotIds;
}

/**
 * Human-readable schedule window for list/detail.
 * Court: min start → (max start + 1h). Open Play / clinic: listed starts.
 */
export function bookingTimeRange(booking: {
  plan: BookingPlan;
  slotIds: string[];
  courtSlots?: CourtSlotSegment[];
}): string {
  const slotIds = slotIdsForRange(booking);
  if (slotIds.length === 0) return "Time TBD";

  if (booking.plan !== "court") {
    return [...new Set(slotIds)].map(formatSlotTime).join(", ");
  }

  const hours = [
    ...new Set(
      slotIds
        .map((id) => Number(id.slice(0, 2)))
        .filter((hour) => !Number.isNaN(hour)),
    ),
  ].sort((a, b) => a - b);

  if (hours.length === 0) return slotIds.join(", ");

  const start = hours[0]!;
  const end = hours[hours.length - 1]! + 1;
  return `${formatHour(start)} – ${formatHour(end)}`;
}
