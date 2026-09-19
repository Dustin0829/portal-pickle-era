/** Exact court-rent copy when an hour is covered by Open Play (one-way block). */
export const OPEN_PLAY_RESERVED_LABEL = "Reserved for Open play";

export type CourtHourHold = "pending" | "approved" | null;

/**
 * Court rent hour presentation. Court hold beats Open Play reserved style.
 * Open Play never disables Open Play session pickers (handled separately).
 */
export function resolveCourtHourPresentation(input: {
  hold: CourtHourHold;
  openPlayHold: boolean;
  past: boolean;
  hasCourt: boolean;
}): {
  selectable: boolean;
  reservedForOpenPlay: boolean;
  pending: boolean;
  approved: boolean;
  label: typeof OPEN_PLAY_RESERVED_LABEL | null;
  className: string;
} {
  const pending = input.hold === "pending";
  const approved = input.hold === "approved";
  const reservedForOpenPlay = input.openPlayHold && input.hold === null;
  const selectable =
    input.hasCourt && !input.past && input.hold === null && !input.openPlayHold;

  let className = "border border-white/10 text-white/25";
  if (selectable) {
    className =
      "border border-white/20 text-white hover:border-yellow hover:text-yellow";
  } else if (pending) {
    className = "border border-amber-400/45 bg-amber-400/10 text-amber-100";
  } else if (reservedForOpenPlay) {
    className = "bg-yellow text-black";
  } else if (approved) {
    className = "border border-white/10 text-white/35";
  }

  return {
    selectable,
    reservedForOpenPlay,
    pending,
    approved,
    label: reservedForOpenPlay ? OPEN_PLAY_RESERVED_LABEL : null,
    className,
  };
}
