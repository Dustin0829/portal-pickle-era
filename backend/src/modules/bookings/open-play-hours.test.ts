import assert from "node:assert/strict";
import test from "node:test";
import {
  expandOpenPlaySessionToHourIds,
  coveredHoursForOpenPlaySlotIds,
  hourSetsOverlap,
} from "./open-play-hours.js";

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

test("hourSetsOverlap detects shared hours", () => {
  assert.equal(hourSetsOverlap(["07:00", "08:00"], ["08:00"]), true);
  assert.equal(hourSetsOverlap(["07:00"], ["09:00"]), false);
});
