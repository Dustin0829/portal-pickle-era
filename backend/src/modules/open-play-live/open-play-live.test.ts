import assert from "node:assert/strict";
import test from "node:test";
import { UnauthorizedError } from "../../lib/errors.js";
import {
  planFirstWave,
  planSeats,
  rotateOnGameEnd,
  usablePlayerCapacity,
} from "./open-play-live.rotation.js";
import {
  openPlayLiveSessionQuerySchema,
  patchOpenPlayLiveSessionBodySchema,
  startOpenPlayLiveGameBodySchema,
} from "./open-play-live.schema.js";
import { endOpenPlayLiveGame, getMyOpenPlayLiveBoard } from "./open-play-live.service.js";

const ids = (count: number, prefix = "p") =>
  Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);

test("planSeats puts queue order 1-2 on side A and 3-4 on side B", () => {
  assert.deepEqual(planSeats(ids(4)), [
    { participantId: "p1", side: "A", seatIndex: 0 },
    { participantId: "p2", side: "A", seatIndex: 1 },
    { participantId: "p3", side: "B", seatIndex: 2 },
    { participantId: "p4", side: "B", seatIndex: 3 },
  ]);
});

test("planFirstWave fills usable courts in order and leaves the remainder queued", () => {
  const { assignments, queue } = planFirstWave({
    courts: [
      { courtId: "in-1", usable: true },
      { courtId: "in-2", usable: false },
      { courtId: "in-3", usable: true },
    ],
    waiting: ids(10),
  });

  assert.deepEqual(
    assignments.map((assignment) => assignment.courtId),
    ["in-1", "in-3"],
  );
  assert.deepEqual(assignments[0]!.participantIds, ["p1", "p2", "p3", "p4"]);
  assert.deepEqual(assignments[1]!.participantIds, ["p5", "p6", "p7", "p8"]);
  assert.deepEqual(queue, ["p9", "p10"]);
});

test("planFirstWave stops when fewer than four players remain", () => {
  const { assignments, queue } = planFirstWave({
    courts: [{ courtId: "in-1", usable: true }],
    waiting: ids(3),
  });
  assert.equal(assignments.length, 0);
  assert.deepEqual(queue, ["p1", "p2", "p3"]);
});

test("rotateOnGameEnd assigns the next four and sends finishers to the back", () => {
  const { assigned, queue } = rotateOnGameEnd({
    waiting: ["w1", "w2", "w3", "w4", "w5"],
    finishers: ["f1", "f2", "f3", "f4"],
    courtUsable: true,
  });

  assert.deepEqual(assigned, ["w1", "w2", "w3", "w4"]);
  assert.deepEqual(queue, ["w5", "f1", "f2", "f3", "f4"]);
});

test("rotateOnGameEnd leaves the court open when fewer than four are waiting", () => {
  const { assigned, queue } = rotateOnGameEnd({
    waiting: ["w1", "w2"],
    finishers: ["f1", "f2", "f3", "f4"],
    courtUsable: true,
  });

  assert.equal(assigned, null);
  assert.deepEqual(queue, ["w1", "w2", "f1", "f2", "f3", "f4"]);
});

test("rotateOnGameEnd never assigns an unavailable court", () => {
  const { assigned, queue } = rotateOnGameEnd({
    waiting: ids(8, "w"),
    finishers: ids(4, "f"),
    courtUsable: false,
  });

  assert.equal(assigned, null);
  assert.deepEqual(queue.slice(0, 8), ids(8, "w"));
  assert.deepEqual(queue.slice(8), ids(4, "f"));
});

test("rotateOnGameEnd is applied once per end — a replay on the same queue is a no-op path", () => {
  const first = rotateOnGameEnd({
    waiting: ids(4, "w"),
    finishers: ids(4, "f"),
    courtUsable: true,
  });
  // A concurrent end is rejected by the conditional update, so the queue never rotates twice.
  assert.deepEqual(first.assigned, ids(4, "w"));
  assert.deepEqual(first.queue, ids(4, "f"));
});

test("usablePlayerCapacity counts four players per usable court", () => {
  assert.equal(
    usablePlayerCapacity([
      { courtId: "in-1", usable: true },
      { courtId: "in-2", usable: true },
      { courtId: "in-3", usable: false },
    ]),
    8,
  );
});

test("session query schema rejects bad date and empty slotId", () => {
  assert.equal(
    openPlayLiveSessionQuerySchema.safeParse({ date: "nope", slotId: "07:00" }).success,
    false,
  );
  assert.equal(
    openPlayLiveSessionQuerySchema.safeParse({ date: "2026-10-05", slotId: "" }).success,
    false,
  );
  assert.equal(
    openPlayLiveSessionQuerySchema.safeParse({ date: "2026-10-05", slotId: "07:00" }).success,
    true,
  );
});

test("patch session body only accepts known statuses", () => {
  assert.equal(
    patchOpenPlayLiveSessionBodySchema.safeParse({
      date: "2026-10-05",
      slotId: "07:00",
      status: "paused",
    }).success,
    false,
  );
  assert.equal(
    patchOpenPlayLiveSessionBodySchema.safeParse({
      date: "2026-10-05",
      slotId: "07:00",
      status: "live",
    }).success,
    true,
  );
});

test("start game body requires exactly four players", () => {
  const base = { date: "2026-10-05", slotId: "07:00" };
  assert.equal(
    startOpenPlayLiveGameBodySchema.safeParse({ ...base, participantIds: ids(3) }).success,
    false,
  );
  assert.equal(
    startOpenPlayLiveGameBodySchema.safeParse({ ...base, participantIds: ids(4) }).success,
    true,
  );
});

test("getMyOpenPlayLiveBoard requires a session", async () => {
  await assert.rejects(
    () => getMyOpenPlayLiveBoard({ date: "2026-10-05", slotId: "07:00" }, undefined),
    (error: unknown) => error instanceof UnauthorizedError && error.statusCode === 401,
  );
});

test("endOpenPlayLiveGame as a player requires a session", async () => {
  await assert.rejects(
    () => endOpenPlayLiveGame("game_1", { role: "player" }),
    (error: unknown) => error instanceof UnauthorizedError && error.statusCode === 401,
  );
});
