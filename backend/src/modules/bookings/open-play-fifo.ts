/** Facility courts in display/assignment order (matches web COURTS). */
export const OPEN_PLAY_FIFO_COURTS = [
  { id: "in-1", label: "Court 1" },
  { id: "in-2", label: "Court 2" },
  { id: "in-3", label: "Court 3" },
  { id: "out-1", label: "Court 4" },
  { id: "out-2", label: "Court 5" },
  { id: "out-3", label: "Court 6" },
] as const;

export type OpenPlayFifoSeatInput = {
  bookingId: string;
  name: string;
  createdAt: Date | string;
};

export type OpenPlayFifoPlayer = {
  bookingId: string;
  name: string;
  queueIndex: number;
};

export type OpenPlayFifoSide = "A" | "B";

export type OpenPlayFifoFoursome = {
  sideA: OpenPlayFifoPlayer[];
  sideB: OpenPlayFifoPlayer[];
  courtId: string | null;
  courtLabel: string | null;
};

export type OpenPlayFifoBoard = {
  date: string;
  slotId: string;
  players: OpenPlayFifoPlayer[];
  courts: OpenPlayFifoFoursome[];
  nextUp: OpenPlayFifoFoursome[];
  remainder: OpenPlayFifoPlayer[];
};

function toTime(value: Date | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

/** Sort seats FIFO: createdAt ASC, then bookingId ASC. */
export function sortOpenPlayFifoSeats(seats: OpenPlayFifoSeatInput[]): OpenPlayFifoSeatInput[] {
  return [...seats].sort((a, b) => {
    const dt = toTime(a.createdAt) - toTime(b.createdAt);
    if (dt !== 0) return dt;
    return a.bookingId.localeCompare(b.bookingId);
  });
}

/**
 * Build FIFO board: groups of 4 (1–2 vs 3–4), assign to Courts 1–6, overflow next-up, tail remainder.
 */
export function buildOpenPlayFifoBoard(input: {
  date: string;
  slotId: string;
  seats: OpenPlayFifoSeatInput[];
}): OpenPlayFifoBoard {
  const ordered = sortOpenPlayFifoSeats(input.seats);
  const players: OpenPlayFifoPlayer[] = ordered.map((seat, index) => ({
    bookingId: seat.bookingId,
    name: seat.name,
    queueIndex: index + 1,
  }));

  const complete: OpenPlayFifoFoursome[] = [];
  let i = 0;
  while (i + 4 <= players.length) {
    const group = players.slice(i, i + 4);
    complete.push({
      sideA: [group[0]!, group[1]!],
      sideB: [group[2]!, group[3]!],
      courtId: null,
      courtLabel: null,
    });
    i += 4;
  }
  const remainder = players.slice(i);

  const courts: OpenPlayFifoFoursome[] = [];
  const nextUp: OpenPlayFifoFoursome[] = [];
  complete.forEach((foursome, index) => {
    const court = OPEN_PLAY_FIFO_COURTS[index];
    if (court) {
      courts.push({
        ...foursome,
        courtId: court.id,
        courtLabel: court.label,
      });
    } else {
      nextUp.push(foursome);
    }
  });

  return {
    date: input.date,
    slotId: input.slotId,
    players,
    courts,
    nextUp,
    remainder,
  };
}

export type OpenPlayFifoMyPosition = {
  date: string;
  slotId: string;
  bookingId: string;
  queueIndex: number;
  status: "on_court" | "next_up" | "remainder";
  courtId: string | null;
  courtLabel: string | null;
  side: OpenPlayFifoSide | null;
};

export function findOpenPlayFifoMyPosition(
  board: OpenPlayFifoBoard,
  bookingId: string,
): OpenPlayFifoMyPosition | null {
  const player = board.players.find((p) => p.bookingId === bookingId);
  if (!player) return null;

  for (const foursome of board.courts) {
    const side = sideForPlayer(foursome, bookingId);
    if (side) {
      return {
        date: board.date,
        slotId: board.slotId,
        bookingId,
        queueIndex: player.queueIndex,
        status: "on_court",
        courtId: foursome.courtId,
        courtLabel: foursome.courtLabel,
        side,
      };
    }
  }

  for (const foursome of board.nextUp) {
    const side = sideForPlayer(foursome, bookingId);
    if (side) {
      return {
        date: board.date,
        slotId: board.slotId,
        bookingId,
        queueIndex: player.queueIndex,
        status: "next_up",
        courtId: null,
        courtLabel: null,
        side,
      };
    }
  }

  if (board.remainder.some((p) => p.bookingId === bookingId)) {
    return {
      date: board.date,
      slotId: board.slotId,
      bookingId,
      queueIndex: player.queueIndex,
      status: "remainder",
      courtId: null,
      courtLabel: null,
      side: null,
    };
  }

  return null;
}

function sideForPlayer(foursome: OpenPlayFifoFoursome, bookingId: string): OpenPlayFifoSide | null {
  if (foursome.sideA.some((p) => p.bookingId === bookingId)) return "A";
  if (foursome.sideB.some((p) => p.bookingId === bookingId)) return "B";
  return null;
}
