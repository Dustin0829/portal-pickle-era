import assert from "node:assert/strict";
import test from "node:test";
import {
  buildOpenPlayFifoBoard,
  findOpenPlayFifoMyPosition,
  sortOpenPlayFifoSeats,
} from "./open-play-fifo.js";
import { openPlayFifoQueueQuerySchema } from "./bookings.schema.js";
import { getMyOpenPlayFifoPosition } from "./bookings.service.js";
import { UnauthorizedError } from "../../lib/errors.js";

test("sortOpenPlayFifoSeats orders by createdAt then id", () => {
  const sorted = sortOpenPlayFifoSeats([
    { bookingId: "b", name: "B", createdAt: "2026-10-05T12:00:00.000Z" },
    { bookingId: "a", name: "A", createdAt: "2026-10-05T11:00:00.000Z" },
    { bookingId: "c", name: "C", createdAt: "2026-10-05T11:00:00.000Z" },
  ]);
  assert.deepEqual(
    sorted.map((s) => s.bookingId),
    ["a", "c", "b"],
  );
});

test("buildOpenPlayFifoBoard empty session", () => {
  const board = buildOpenPlayFifoBoard({
    date: "2026-10-05",
    slotId: "07:00",
    seats: [],
  });
  assert.equal(board.players.length, 0);
  assert.equal(board.courts.length, 0);
  assert.equal(board.nextUp.length, 0);
  assert.equal(board.remainder.length, 0);
});

test("buildOpenPlayFifoBoard sides and court assignment", () => {
  const seats = Array.from({ length: 5 }, (_, i) => ({
    bookingId: `bk_${i + 1}`,
    name: `P${i + 1}`,
    createdAt: `2026-10-05T0${i}:00:00.000Z`,
  }));
  const board = buildOpenPlayFifoBoard({
    date: "2026-10-05",
    slotId: "07:00",
    seats,
  });
  assert.equal(board.courts.length, 1);
  assert.equal(board.courts[0]!.courtId, "in-1");
  assert.equal(board.courts[0]!.sideA[0]!.bookingId, "bk_1");
  assert.equal(board.courts[0]!.sideA[1]!.bookingId, "bk_2");
  assert.equal(board.courts[0]!.sideB[0]!.bookingId, "bk_3");
  assert.equal(board.courts[0]!.sideB[1]!.bookingId, "bk_4");
  assert.equal(board.remainder.length, 1);
  assert.equal(board.remainder[0]!.bookingId, "bk_5");
});

test("buildOpenPlayFifoBoard caps courts at six and puts overflow in nextUp", () => {
  const seats = Array.from({ length: 30 }, (_, i) => ({
    bookingId: `bk_${String(i + 1).padStart(2, "0")}`,
    name: `P${i + 1}`,
    createdAt: new Date(Date.UTC(2026, 9, 5, 0, i, 0)).toISOString(),
  }));
  const board = buildOpenPlayFifoBoard({
    date: "2026-10-05",
    slotId: "16:00",
    seats,
  });
  assert.equal(board.courts.length, 6);
  assert.equal(board.nextUp.length, 1);
  assert.equal(board.remainder.length, 2);
  assert.equal(board.courts[5]!.courtId, "out-3");
});

test("findOpenPlayFifoMyPosition reports on_court side", () => {
  const board = buildOpenPlayFifoBoard({
    date: "2026-10-05",
    slotId: "07:00",
    seats: [
      { bookingId: "1", name: "A", createdAt: "2026-10-05T10:00:00.000Z" },
      { bookingId: "2", name: "B", createdAt: "2026-10-05T10:01:00.000Z" },
      { bookingId: "3", name: "C", createdAt: "2026-10-05T10:02:00.000Z" },
      { bookingId: "4", name: "D", createdAt: "2026-10-05T10:03:00.000Z" },
    ],
  });
  const pos = findOpenPlayFifoMyPosition(board, "2");
  assert.equal(pos?.status, "on_court");
  assert.equal(pos?.side, "A");
  assert.equal(pos?.queueIndex, 2);
  assert.equal(pos?.courtId, "in-1");
});

test("openPlayFifoQueueQuerySchema rejects invalid date and empty slotId", () => {
  assert.equal(
    openPlayFifoQueueQuerySchema.safeParse({ date: "bad", slotId: "07:00" }).success,
    false,
  );
  assert.equal(
    openPlayFifoQueueQuerySchema.safeParse({ date: "2026-10-05", slotId: "" }).success,
    false,
  );
  assert.equal(
    openPlayFifoQueueQuerySchema.safeParse({ date: "2026-10-05", slotId: "07:00" }).success,
    true,
  );
});

test("getMyOpenPlayFifoPosition requires session", async () => {
  await assert.rejects(
    () => getMyOpenPlayFifoPosition({ date: "2026-10-05", slotId: "07:00" }, undefined),
    (error: unknown) => error instanceof UnauthorizedError && error.statusCode === 401,
  );
});
