import assert from "node:assert/strict";
import test from "node:test";
import { UnauthorizedError } from "../../lib/errors.js";
import {
  generateTempPassword,
  planInviteCredentialsEmail,
} from "../../lib/auth/create-student-user.js";
import { isResendConfigured } from "../../lib/resend/client.js";
import {
  isBeforeOpeningDate,
  normalizeSlotIds,
  planFromApi,
  planToApi,
  slotsOverlap,
  toBookingDto,
} from "./bookings.mapper.js";
import { ConflictError } from "../../lib/errors.js";
import {
  OPENING_DATE,
  OPEN_PLAY_CAPACITY,
  bookingReceiptUrlResponseSchema,
  createPublicBookingBodySchema,
  occupancyQuerySchema,
  openPlaySessionsQuerySchema,
  patchBookingBodySchema,
  patchBookingResponseSchema,
} from "./bookings.schema.js";
import {
  aggregateOpenPlayCounts,
  assertOpenPlayHasSeat,
  listMyBookings,
  usesOpenPlayCapacity,
} from "./bookings.service.js";

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

test("public booking schema rejects clinic plan on create", () => {
  assert.equal(
    createPublicBookingBodySchema.safeParse({
      plan: "clinic",
      date: "2026-10-05",
      courtId: "in-1",
      slotIds: ["08:00"],
      name: "Ada",
      email: "ada@example.com",
    }).success,
    false,
  );
});

test("public booking schema accepts court and open-play", () => {
  assert.equal(
    createPublicBookingBodySchema.safeParse({
      plan: "court",
      date: "2026-10-05",
      courtId: "in-1",
      slotIds: ["08:00"],
      name: "Ada",
      email: "ada@example.com",
    }).success,
    true,
  );
  assert.equal(
    createPublicBookingBodySchema.safeParse({
      plan: "open-play",
      date: "2026-10-05",
      courtId: "in-1",
      slotIds: ["07:00"],
      name: "Ada",
      email: "ada@example.com",
    }).success,
    true,
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

test("receipt url response schema", () => {
  assert.equal(
    bookingReceiptUrlResponseSchema.safeParse({
      url: "https://storage.example/object?X-Amz-Signature=abc",
      expiresAt: "2026-01-01T00:05:00.000Z",
    }).success,
    true,
  );
  assert.equal(
    bookingReceiptUrlResponseSchema.safeParse({
      url: "not-a-url",
      expiresAt: "soon",
    }).success,
    false,
  );
  assert.equal(
    bookingReceiptUrlResponseSchema.safeParse({
      url: "https://storage.example/object",
    }).success,
    false,
  );
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
    walletAppliedCents: 0,
    status: "pending",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  });
  assert.equal(dto.plan, "open-play");
  assert.equal(dto.walletAppliedCents, 0);
});

test("open-play sessions query requires date", () => {
  assert.equal(openPlaySessionsQuerySchema.safeParse({}).success, false);
  assert.equal(openPlaySessionsQuerySchema.safeParse({ date: "2026-10-05" }).success, true);
});

test("OPEN_PLAY_CAPACITY is 30", () => {
  assert.equal(OPEN_PLAY_CAPACITY, 30);
});

test("open-play uses shared capacity; court/clinic stay exclusive", () => {
  assert.equal(usesOpenPlayCapacity("open_play"), true);
  assert.equal(usesOpenPlayCapacity("court"), false);
  assert.equal(usesOpenPlayCapacity("clinic"), false);
});

test("under capacity allows a seat", () => {
  assert.doesNotThrow(() => assertOpenPlayHasSeat(0, "07:00"));
  assert.doesNotThrow(() => assertOpenPlayHasSeat(29, "07:00"));
});

test("full session rejects at capacity", () => {
  assert.throws(
    () => assertOpenPlayHasSeat(OPEN_PLAY_CAPACITY, "07:00"),
    (error: unknown) => error instanceof ConflictError && /full \(30\/30\)/.test(error.message),
  );
});

test("concurrent last-seat: only one succeeds when racing from 29", () => {
  let booked = 29;
  assert.doesNotThrow(() => {
    assertOpenPlayHasSeat(booked, "16:00");
    booked += 1;
  });
  assert.throws(
    () => assertOpenPlayHasSeat(booked, "16:00"),
    (error: unknown) => error instanceof ConflictError,
  );
  assert.equal(booked, OPEN_PLAY_CAPACITY);
});

test("aggregateOpenPlayCounts sums pending/approved seats per slot", () => {
  assert.deepEqual(
    aggregateOpenPlayCounts([
      { slotIds: ["07:00"] },
      { slotIds: ["07:00"] },
      { slotIds: ["16:00"] },
    ]),
    [
      { slotId: "07:00", bookedCount: 2, capacity: 30 },
      { slotId: "16:00", bookedCount: 1, capacity: 30 },
    ],
  );
  assert.deepEqual(aggregateOpenPlayCounts([]), []);
});

test("listMyBookings requires session", async () => {
  await assert.rejects(
    () => listMyBookings(undefined),
    (error: unknown) => {
      return error instanceof UnauthorizedError && error.statusCode === 401;
    },
  );
});

test("planInviteCredentialsEmail: new user + configured → send", () => {
  assert.equal(
    planInviteCredentialsEmail({ createdNewUser: true, resendConfigured: true }),
    "send",
  );
});

test("planInviteCredentialsEmail: existing user skips invite (second approve no resend)", () => {
  assert.equal(
    planInviteCredentialsEmail({ createdNewUser: false, resendConfigured: true }),
    "skip_existing_user",
  );
  assert.equal(
    planInviteCredentialsEmail({ createdNewUser: false, resendConfigured: false }),
    "skip_existing_user",
  );
});

test("planInviteCredentialsEmail: missing env skips send", () => {
  assert.equal(
    planInviteCredentialsEmail({ createdNewUser: true, resendConfigured: false }),
    "skip_not_configured",
  );
  assert.equal(isResendConfigured(), false);
});

test("generateTempPassword is non-empty URL-safe string", () => {
  const password = generateTempPassword();
  assert.ok(password.length >= 16);
  assert.equal(password.includes("+"), false);
  assert.equal(password.includes("/"), false);
});

test("patchBookingResponseSchema accepts inviteEmailWarning (email fail keeps approved shape)", () => {
  const base = {
    id: "bk_1",
    plan: "court" as const,
    date: "2026-10-05",
    courtId: "in-1",
    slotIds: ["08:00"],
    name: "Ada",
    email: "ada@example.com",
    userId: "user_1",
    referenceId: "REF",
    receiptName: null,
    receiptKey: null,
    receiptMimeType: null,
    walletAppliedCents: 0,
    status: "approved" as const,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  assert.equal(patchBookingResponseSchema.safeParse(base).success, true);
  assert.equal(
    patchBookingResponseSchema.safeParse({
      ...base,
      inviteEmailWarning: "Invite email failed: rate limited",
    }).success,
    true,
  );
  assert.equal(patchBookingBodySchema.safeParse({ status: "rejected" }).success, true);
});
