import assert from "node:assert/strict";
import test from "node:test";
import { bookingTotalCents, clampWalletAppliedCents } from "../bookings/bookings.service.js";
import { UnauthorizedError } from "../../lib/errors.js";
import { assertAdjacentFoodStatus } from "./food.schema.js";
import { listMyFoodOrders } from "./food.service.js";

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

test("listMyFoodOrders requires session", async () => {
  await assert.rejects(
    () => listMyFoodOrders(undefined),
    (error: unknown) => error instanceof UnauthorizedError && error.statusCode === 401,
  );
});
