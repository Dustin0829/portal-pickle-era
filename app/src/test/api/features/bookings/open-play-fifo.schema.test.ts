import { describe, expect, it } from "vitest";
import {
  openPlayFifoBoardSchema,
  openPlayFifoMyPositionSchema,
  openPlayFifoQueueQuerySchema,
} from "@/api/features/bookings/bookings.schema";

function player(bookingId: string, name: string, queueIndex: number) {
  return { bookingId, name, queueIndex };
}

/** Fixture: 5 seats → one court foursome + remainder of 1. */
const fiveSeatBoard = {
  date: "2026-10-05",
  slotId: "07:00",
  players: [
    player("bk_1", "P1", 1),
    player("bk_2", "P2", 2),
    player("bk_3", "P3", 3),
    player("bk_4", "P4", 4),
    player("bk_5", "P5", 5),
  ],
  courts: [
    {
      sideA: [player("bk_1", "P1", 1), player("bk_2", "P2", 2)],
      sideB: [player("bk_3", "P3", 3), player("bk_4", "P4", 4)],
      courtId: "in-1",
      courtLabel: "Court 1",
    },
  ],
  nextUp: [],
  remainder: [player("bk_5", "P5", 5)],
};

/** Fixture: 30 seats → 6 courts, 1 next-up foursome, remainder of 2. */
const thirtySeatBoard = {
  date: "2026-10-05",
  slotId: "16:00",
  players: Array.from({ length: 30 }, (_, i) =>
    player(`bk_${String(i + 1).padStart(2, "0")}`, `P${i + 1}`, i + 1),
  ),
  courts: Array.from({ length: 6 }, (_, courtIndex) => {
    const base = courtIndex * 4;
    const ids = [1, 2, 3, 4].map((n) => base + n);
    return {
      sideA: [
        player(`bk_${String(ids[0]).padStart(2, "0")}`, `P${ids[0]}`, ids[0]),
        player(`bk_${String(ids[1]).padStart(2, "0")}`, `P${ids[1]}`, ids[1]),
      ],
      sideB: [
        player(`bk_${String(ids[2]).padStart(2, "0")}`, `P${ids[2]}`, ids[2]),
        player(`bk_${String(ids[3]).padStart(2, "0")}`, `P${ids[3]}`, ids[3]),
      ],
      courtId: ["in-1", "in-2", "in-3", "out-1", "out-2", "out-3"][courtIndex],
      courtLabel: `Court ${courtIndex + 1}`,
    };
  }),
  nextUp: [
    {
      sideA: [player("bk_25", "P25", 25), player("bk_26", "P26", 26)],
      sideB: [player("bk_27", "P27", 27), player("bk_28", "P28", 28)],
      courtId: null,
      courtLabel: null,
    },
  ],
  remainder: [player("bk_29", "P29", 29), player("bk_30", "P30", 30)],
};

describe("open-play FIFO schemas", () => {
  it("rejects invalid queue query", () => {
    expect(
      openPlayFifoQueueQuerySchema.safeParse({
        date: "bad",
        slotId: "07:00",
      }).success,
    ).toBe(false);
    expect(
      openPlayFifoQueueQuerySchema.safeParse({
        date: "2026-10-05",
        slotId: "",
      }).success,
    ).toBe(false);
  });

  it("parses five-seat board grouping (court + remainder)", () => {
    const board = openPlayFifoBoardSchema.parse(fiveSeatBoard);
    expect(board.courts).toHaveLength(1);
    expect(board.courts[0]?.sideA.map((p) => p.queueIndex)).toEqual([1, 2]);
    expect(board.courts[0]?.sideB.map((p) => p.queueIndex)).toEqual([3, 4]);
    expect(board.remainder).toHaveLength(1);
    expect(board.nextUp).toHaveLength(0);
  });

  it("parses thirty-seat board (courts + next-up + remainder)", () => {
    const board = openPlayFifoBoardSchema.parse(thirtySeatBoard);
    expect(board.courts).toHaveLength(6);
    expect(board.nextUp).toHaveLength(1);
    expect(board.remainder).toHaveLength(2);
    expect(board.courts[5]?.courtId).toBe("out-3");
  });

  it("parses assigned player position on court", () => {
    const position = openPlayFifoMyPositionSchema.parse({
      date: "2026-10-05",
      slotId: "07:00",
      bookingId: "bk_2",
      queueIndex: 2,
      status: "on_court",
      courtId: "in-1",
      courtLabel: "Court 1",
      side: "A",
    });
    expect(position.status).toBe("on_court");
    expect(position.side).toBe("A");
    expect(position.courtLabel).toBe("Court 1");
  });

  it("parses remainder player position (waiting)", () => {
    const position = openPlayFifoMyPositionSchema.parse({
      date: "2026-10-05",
      slotId: "07:00",
      bookingId: "bk_5",
      queueIndex: 5,
      status: "remainder",
      courtId: null,
      courtLabel: null,
      side: null,
    });
    expect(position.status).toBe("remainder");
    expect(position.side).toBeNull();
  });

  it("rejects empty assigned position payload", () => {
    expect(openPlayFifoMyPositionSchema.safeParse({}).success).toBe(false);
  });
});
