import { formatHour, SLOTS, type TimeSlot } from "@/lib/booking/booking";
import { useFacilitySettingsStore } from "@/lib/stores/facilitySettingsStore";

/** Build a 2-hour open-play label from start hour. */
export function labelOpenPlayWindow(hour: number) {
  return `${formatHour(hour)} – ${formatHour(hour + 2)}`;
}

export function slotFromOpenPlayHour(hour: number): TimeSlot {
  return {
    id: `${String(hour).padStart(2, "0")}:00`,
    hour,
    label: labelOpenPlayWindow(hour),
  };
}

export function getOpenPlaySlots(): TimeSlot[] {
  const saved = useFacilitySettingsStore.getState().openPlaySlots;
  if (saved?.length) {
    return saved.map((slot) => ({
      ...slot,
      label: slot.label || labelOpenPlayWindow(slot.hour),
    }));
  }
  return SLOTS["open-play"].map((slot) => ({ ...slot }));
}

export function useOpenPlaySlots(): TimeSlot[] {
  const slots = useFacilitySettingsStore((state) => state.openPlaySlots);
  if (slots?.length) {
    return slots.map((slot) => ({
      ...slot,
      label: slot.label || labelOpenPlayWindow(slot.hour),
    }));
  }
  return SLOTS["open-play"].map((slot) => ({ ...slot }));
}
