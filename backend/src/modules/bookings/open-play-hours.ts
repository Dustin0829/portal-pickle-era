/** Default Open Play sessions (aligned with web `SLOTS["open-play"]`). */
export const DEFAULT_OPEN_PLAY_SESSIONS = [
  { slotId: "07:00", hour: 7, durationHours: 2 },
  { slotId: "16:00", hour: 16, durationHours: 2 },
  { slotId: "18:00", hour: 18, durationHours: 2 },
] as const;

export type OpenPlaySessionLike = {
  slotId: string;
  hour: number;
  durationHours: number;
};

export function hourIdFromHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** Expand an Open Play session start hour into covered court hour ids. */
export function expandOpenPlaySessionToHourIds(input: {
  hour: number;
  durationHours?: number;
}): string[] {
  const duration = input.durationHours && input.durationHours > 0 ? input.durationHours : 2;
  const hours: string[] = [];
  for (let i = 0; i < duration; i += 1) {
    hours.push(hourIdFromHour(input.hour + i));
  }
  return hours;
}

function parseHourFromSlotId(slotId: string): number | null {
  const match = /^(\d{1,2}):00$/.exec(slotId.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  return hour;
}

function resolveSession(
  slotId: string,
  sessions: readonly OpenPlaySessionLike[],
): { hour: number; durationHours: number } {
  const known = sessions.find((s) => s.slotId === slotId);
  if (known) {
    return { hour: known.hour, durationHours: known.durationHours };
  }
  const hour = parseHourFromSlotId(slotId);
  if (hour === null) {
    return { hour: 0, durationHours: 0 };
  }
  return { hour, durationHours: 2 };
}

/** Covered court hours for one or more Open Play session slot ids. */
export function coveredHoursForOpenPlaySlotIds(
  slotIds: string[],
  sessions: readonly OpenPlaySessionLike[] = DEFAULT_OPEN_PLAY_SESSIONS,
): string[] {
  const set = new Set<string>();
  for (const slotId of slotIds) {
    const session = resolveSession(slotId, sessions);
    if (session.durationHours <= 0) continue;
    for (const hourId of expandOpenPlaySessionToHourIds(session)) {
      set.add(hourId);
    }
  }
  return [...set].sort();
}

export function hourSetsOverlap(a: string[], b: string[]): boolean {
  const set = new Set(a);
  return b.some((id) => set.has(id));
}
