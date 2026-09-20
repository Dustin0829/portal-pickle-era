import { formatHour, SLOTS, type TimeSlot } from "@/lib/booking/booking";
import { expandOpenPlaySessionToHourIds } from "@/lib/booking/openPlayHours";
import { facilitySettingsQueryKey } from "@/api/features/facility-settings/use-facility-settings";
import type { FacilitySettingsDto } from "@/api/features/facility-settings/facility-settings.schema";
import {
  fallbackFacilitySettings,
  openPlaySlotsFromSettings,
} from "@/lib/facility/facilitySettingsView";
import { queryClient } from "@/providers/QueryProvider";
import { useFacilitySettings } from "@/api/features/facility-settings/use-facility-settings";

/** Build an open-play label from start hour + duration. */
export function labelOpenPlayWindow(hour: number, durationHours = 2) {
  const duration = durationHours > 0 ? durationHours : 2;
  return `${formatHour(hour)} – ${formatHour(hour + duration)}`;
}

export function slotFromOpenPlayHour(
  hour: number,
  durationHours = 2,
): TimeSlot {
  const duration = durationHours > 0 ? durationHours : 2;
  return {
    id: `${String(hour).padStart(2, "0")}:00`,
    hour,
    durationHours: duration,
    label: labelOpenPlayWindow(hour, duration),
  };
}

/** Preview covered court hour ids for a session. */
export function previewCoveredHours(slot: {
  hour: number;
  durationHours?: number;
}): string[] {
  return expandOpenPlaySessionToHourIds({
    hour: slot.hour,
    durationHours: slot.durationHours,
  });
}

function normalizeOpenPlaySlot(slot: TimeSlot): TimeSlot {
  const duration =
    slot.durationHours && slot.durationHours > 0 ? slot.durationHours : 2;
  return {
    ...slot,
    durationHours: duration,
    label: slot.label || labelOpenPlayWindow(slot.hour, duration),
  };
}

function cachedOrFallback(): FacilitySettingsDto {
  return (
    queryClient.getQueryData<FacilitySettingsDto>(facilitySettingsQueryKey) ??
    fallbackFacilitySettings()
  );
}

export function getOpenPlaySlots(): TimeSlot[] {
  const slots = openPlaySlotsFromSettings(cachedOrFallback());
  if (slots.length) {
    return slots.map(normalizeOpenPlaySlot);
  }
  return SLOTS["open-play"].map((slot) => ({ ...slot }));
}

export function useOpenPlaySlots(): TimeSlot[] {
  const { data } = useFacilitySettings();
  const slots = openPlaySlotsFromSettings(data ?? fallbackFacilitySettings());
  if (slots.length) {
    return slots.map(normalizeOpenPlaySlot);
  }
  return SLOTS["open-play"].map((slot) => ({ ...slot }));
}
