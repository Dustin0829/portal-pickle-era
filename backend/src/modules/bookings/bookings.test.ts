import assert from "node:assert/strict";
import test from "node:test";
import { UnauthorizedError } from "../../lib/errors.js";
import {
  isBeforeOpeningDate,
  normalizeSlotIds,
  planFromApi,
  planToApi,
  slotsOverlap,
  toBookingDto,
} from "./bookings.mapper.js";
import {
  OPENING_DATE,
  createPublicBookingBodySchema,
  occupancyQuerySchema,
  patchBookingBodySchema,
} from "./bookings.schema.js";
import { listMyBookings } from "./bookings.service.js";

test("opening date floor helper", () => {
  assert.equal(isBeforeOpeningDate("2026-10-04", OPENING_DATE), true);
  assert.equal(isBeforeOpeningDate("2026-10-05", OPENING_DATE), false);
  assert.equal(isBeforeOpeningDate("2026-11-01", OPENING_DATE), false);
});

test("slotsOverlap detects shared ids", () => {
  assert.equal(slotsOverlap(["08:00", "09:00"], ["09:00"]), true);
  assert.equal(slotsOverlap(["08:00"], ["10:00"]), false);
});

test("normalizeSlotIds unique sorted", () => {
  assert.deepEqual(normalizeSlotIds(["09:00", "08:00", "09:00"]), ["08:00", "09:00"]);
});

test("plan api mapping", () => {
  assert.equal(planFromApi("open-play"), "open_play");
  assert.equal(planToApi("open_play"), "open-play");
});

test("public booking schema rejects bad date", () => {
  assert.equal(
    createPublicBookingBodySchema.safeParse({
      plan: "court",
      date: "10/05/2026",
      courtId: "in-1",
      slotIds: ["08:00"],
      name: "Ada",
      email: "ada@example.com",
    }).success,
    false,
  );
});

test("occupancy query requires date or from+to", () => {
  assert.equal(occupancyQuerySchema.safeParse({}).success, false);
  assert.equal(occupancyQuerySchema.safeParse({ date: "2026-10-05" }).success, true);
  assert.equal(
    occupancyQuerySchema.safeParse({ from: "2026-10-01", to: "2026-10-31" }).success,
    true,
  );
  assert.equal(
    occupancyQuerySchema.safeParse({ from: "2026-10-31", to: "2026-10-01" }).success,
    false,
  );
});

test("patch status only approved or rejected", () => {
  assert.equal(patchBookingBodySchema.safeParse({ status: "pending" }).success, false);
  assert.equal(patchBookingBodySchema.safeParse({ status: "approved" }).success, true);
});

test("booking mapper serializes", () => {
  const dto = toBookingDto({
    id: "b1",
    plan: "open_play",
    date: "2026-10-05",
    courtId: "in-1",
    slotIds: ["08:00"],
    name: "Ada",
    email: "ada@example.com",
    userId: null,
    referenceId: "REF",
    receiptName: null,
    receiptKey: null,
    receiptMimeType: null,
    status: "pending",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  });
  assert.equal(dto.plan, "open-play");
  assert.equal(dto.status, "pending");
});

test("listMyBookings requires session", async () => {
  await assert.rejects(
    () => listMyBookings(undefined),
    (error: unknown) => {
      return error instanceof UnauthorizedError && error.statusCode === 401;
    },
  );
});
