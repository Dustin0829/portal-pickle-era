/** Players per game (doubles). */
export const OPEN_PLAY_GAME_SEATS = 4;

export type OpenPlaySide = "A" | "B";

export type OpenPlaySeatPlan = {
  participantId: string;
  side: OpenPlaySide;
  seatIndex: number;
};

/** Seats 0-1 are side A, seats 2-3 are side B (queue order decides sides). */
export function planSeats(participantIds: string[]): OpenPlaySeatPlan[] {
  return participantIds.map((participantId, seatIndex) => ({
    participantId,
    side: seatIndex < 2 ? "A" : "B",
    seatIndex,
  }));
}

export type OpenPlayCourtSlot = {
  courtId: string;
  usable: boolean;
};

export type OpenPlayWaveAssignment = {
  courtId: string;
  participantIds: string[];
};

/** Fill usable courts in facility order with foursomes from the front of the queue. */
export function planFirstWave(input: { courts: OpenPlayCourtSlot[]; waiting: string[] }): {
  assignments: OpenPlayWaveAssignment[];
  queue: string[];
} {
  const assignments: OpenPlayWaveAssignment[] = [];
  let remaining = input.waiting;

  for (const court of input.courts) {
    if (!court.usable) continue;
    if (remaining.length < OPEN_PLAY_GAME_SEATS) break;
    assignments.push({
      courtId: court.courtId,
      participantIds: remaining.slice(0, OPEN_PLAY_GAME_SEATS),
    });
    remaining = remaining.slice(OPEN_PLAY_GAME_SEATS);
  }

  return { assignments, queue: remaining };
}

/**
 * Fair rotation when a game ends: the next four waiters (not the finishers) take
 * the court, then finishers go to the back of UP NEXT.
 */
export function rotateOnGameEnd(input: {
  waiting: string[];
  finishers: string[];
  courtUsable: boolean;
}): { assigned: string[] | null; queue: string[] } {
  const canAssign = input.courtUsable && input.waiting.length >= OPEN_PLAY_GAME_SEATS;
  const assigned = canAssign ? input.waiting.slice(0, OPEN_PLAY_GAME_SEATS) : null;
  const remaining = canAssign ? input.waiting.slice(OPEN_PLAY_GAME_SEATS) : input.waiting;

  return { assigned, queue: [...remaining, ...input.finishers] };
}

/** Simultaneous player capacity given courts that are not unavailable. */
export function usablePlayerCapacity(courts: OpenPlayCourtSlot[]): number {
  return courts.filter((court) => court.usable).length * OPEN_PLAY_GAME_SEATS;
}
