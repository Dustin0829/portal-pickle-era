import type { BookablePlan } from "@/lib/booking/booking";

export type UnifiedBookingSelection = {
  plan: BookablePlan | null;
  courtId: string;
  slotIds: string[];
};

export const EMPTY_UNIFIED_SELECTION: UnifiedBookingSelection = {
  plan: null,
  courtId: "",
  slotIds: [],
};

/** Open Play picks one session; replaces any court-hour selection. */
export function applyOpenPlaySelect(
  selection: UnifiedBookingSelection,
  slotId: string,
): UnifiedBookingSelection {
  if (selection.plan === "open-play" && selection.slotIds[0] === slotId) {
    return EMPTY_UNIFIED_SELECTION;
  }
  return { plan: "open-play", courtId: "in-1", slotIds: [slotId] };
}

/**
 * Court-hour toggle. Switching courts or leaving Open Play starts a fresh
 * multi-hour selection on that court.
 */
export function applyCourtHourToggle(
  selection: UnifiedBookingSelection,
  courtId: string,
  hourId: string,
): UnifiedBookingSelection {
  if (selection.plan === "open-play" || selection.courtId !== courtId) {
    return { plan: "court", courtId, slotIds: [hourId] };
  }
  const slotIds = selection.slotIds.includes(hourId)
    ? selection.slotIds.filter((id) => id !== hourId)
    : [...selection.slotIds, hourId].sort();
  if (slotIds.length === 0) return EMPTY_UNIFIED_SELECTION;
  return { plan: "court", courtId, slotIds };
}

/** Confirm payload for create booking — null when selection incomplete. */
export function toConfirmSelection(
  date: string,
  selection: UnifiedBookingSelection,
): {
  plan: BookablePlan;
  date: string;
  courtId: string;
  slotIds: string[];
} | null {
  if (!selection.plan || !selection.courtId || selection.slotIds.length === 0) {
    return null;
  }
  return {
    plan: selection.plan,
    date,
    courtId: selection.courtId,
    slotIds: selection.slotIds,
  };
}

/** Map optional open prefer (ignore clinic / unknown). */
export function preferFromOpenArg(
  plan?: string | null,
): BookablePlan | undefined {
  if (plan === "court" || plan === "open-play") return plan;
  return undefined;
}
