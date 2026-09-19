import assert from "node:assert/strict";
import test from "node:test";
import {
  expandOpenPlaySessionToHourIds,
  coveredHoursForOpenPlaySlotIds,
  sessionsBlockedByCourtHours,
} from "../bookings/open-play-hours.js";
import { bookingTotalCents, clampWalletAppliedCents } from "../bookings/bookings.service.js";
import { assertAdjacentFoodStatus } from "./food.schema.js";

test("expandOpenPlaySessionToHourIds covers two hours by default", () => {
  assert.deepEqual(expandOpenPlaySessionToHourIds({ hour: 7 }), ["07:00", "08:00"]);
  assert.deepEqual(expandOpenPlaySessionToHourIds({ hour: 16, durationHours: 2 }), [
    "16:00",
    "17:00",
  ]);
});

test("coveredHoursForOpenPlaySlotIds maps session ids", () => {
  assert.deepEqual(coveredHoursForOpenPlaySlotIds(["07:00"]), ["07:00", "08:00"]);
});

test("sessionsBlockedByCourtHours finds overlapping sessions", () => {
  assert.deepEqual(sessionsBlockedByCourtHours(["08:00"]), ["07:00"]);
  assert.deepEqual(sessionsBlockedByCourtHours(["10:00"]), []);
});

test("clampWalletAppliedCents never exceeds balance or total", () => {
  assert.equal(
    clampWalletAppliedCents({ requested: 60000, balanceCents: 50000, totalCents: 60000 }),
    50000,
  );
  assert.equal(
    clampWalletAppliedCents({ requested: 10000, balanceCents: 50000, totalCents: 60000 }),
    10000,
  );
  assert.equal(
    clampWalletAppliedCents({ requested: undefined, balanceCents: 50000, totalCents: 60000 }),
    0,
  );
});

test("bookingTotalCents uses pesos * slots", () => {
  assert.equal(bookingTotalCents("court", 2, 300), 60000);
  assert.equal(bookingTotalCents("open_play", 1), 25000);
});

test("assertAdjacentFoodStatus only allows forward steps", () => {
  assert.equal(assertAdjacentFoodStatus("pending", "preparing"), true);
  assert.equal(assertAdjacentFoodStatus("preparing", "ready"), true);
  assert.equal(assertAdjacentFoodStatus("pending", "ready"), false);
  assert.equal(assertAdjacentFoodStatus("ready", "preparing"), false);
});
