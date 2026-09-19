import type { BookablePlan, CourtId } from "@/lib/booking/booking";

export type CourtSlotSegment = {
  courtId: CourtId;
  slotIds: string[];
};

export type UnifiedBookingSelection = {
  plan: BookablePlan | null;
  /** @deprecated Prefer courtSlots — primary court for display/compat. */
  courtId: string;
  /** @deprecated Prefer courtSlots — union of hours / OP session id. */
  slotIds: string[];
  /** Private court segments (multi-court). Empty when Open Play or none. */
  courtSlots: CourtSlotSegment[];
};

export const EMPTY_UNIFIED_SELECTION: UnifiedBookingSelection = {
  plan: null,
  courtId: "",
  slotIds: [],
  courtSlots: [],
};

function normalizeSegments(segments: CourtSlotSegment[]): CourtSlotSegment[] {
  return segments
    .map((s) => ({
      courtId: s.courtId,
      slotIds: [...new Set(s.slotIds)].sort(),
    }))
    .filter((s) => s.slotIds.length > 0)
    .sort((a, b) => a.courtId.localeCompare(b.courtId));
}

function fromCourtSlots(
  courtSlots: CourtSlotSegment[],
): UnifiedBookingSelection {
  const normalized = normalizeSegments(courtSlots);
  if (normalized.length === 0) return EMPTY_UNIFIED_SELECTION;
  return {
    plan: "court",
    courtId: normalized[0]!.courtId,
    slotIds: [...new Set(normalized.flatMap((s) => s.slotIds))].sort(),
    courtSlots: normalized,
  };
}

/** Open Play picks one session; replaces any court-hour selection. */
export function applyOpenPlaySelect(
  selection: UnifiedBookingSelection,
  slotId: string,
): UnifiedBookingSelection {
  if (selection.plan === "open-play" && selection.slotIds[0] === slotId) {
    return EMPTY_UNIFIED_SELECTION;
  }
  return {
    plan: "open-play",
    courtId: "in-1",
    slotIds: [slotId],
    courtSlots: [],
  };
}

/**
 * Court-hour toggle. Accumulates across courts; does not reset other courts.
 */
export function applyCourtHourToggle(
  selection: UnifiedBookingSelection,
  courtId: CourtId,
  hourId: string,
): UnifiedBookingSelection {
  const base =
    selection.plan === "court"
      ? selection.courtSlots.length > 0
        ? selection.courtSlots
        : selection.courtId
          ? [{ courtId: selection.courtId, slotIds: selection.slotIds }]
          : []
      : [];

  const map = new Map(base.map((s) => [s.courtId, [...s.slotIds]]));
  const current = map.get(courtId) ?? [];
  if (current.includes(hourId)) {
    const next = current.filter((id) => id !== hourId);
    if (next.length === 0) map.delete(courtId);
    else map.set(courtId, next);
  } else {
    map.set(courtId, [...current, hourId]);
  }

  return fromCourtSlots(
    [...map.entries()].map(([id, slotIds]) => ({
      courtId: id as CourtId,
      slotIds,
    })),
  );
}

export function totalSelectedCourtHours(
  selection: UnifiedBookingSelection,
): number {
  if (selection.plan === "open-play")
    return Math.max(selection.slotIds.length, 1);
  if (selection.courtSlots.length > 0) {
    return selection.courtSlots.reduce((sum, s) => sum + s.slotIds.length, 0);
  }
  return selection.slotIds.length;
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
  courtSlots?: CourtSlotSegment[];
} | null {
  if (!selection.plan) return null;
  if (selection.plan === "open-play") {
    if (!selection.slotIds.length) return null;
    return {
      plan: "open-play",
      date,
      courtId: selection.courtId || "in-1",
      slotIds: selection.slotIds,
    };
  }
  const courtSlots =
    selection.courtSlots.length > 0
      ? selection.courtSlots
      : selection.courtId && selection.slotIds.length
        ? [
            {
              courtId: selection.courtId as CourtId,
              slotIds: selection.slotIds,
            },
          ]
        : [];
  if (courtSlots.length === 0) return null;
  return {
    plan: "court",
    date,
    courtId: courtSlots[0]!.courtId,
    slotIds: [...new Set(courtSlots.flatMap((s) => s.slotIds))].sort(),
    courtSlots,
  };
}

/** Map optional open prefer (ignore clinic / unknown). */
export function preferFromOpenArg(
  plan?: string | null,
): BookablePlan | undefined {
  if (plan === "court" || plan === "open-play") return plan;
  return undefined;
}
