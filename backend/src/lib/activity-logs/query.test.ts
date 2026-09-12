import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVITY_LOGS_UNAVAILABLE_CODE } from "./types.js";
import { assertActivityLogTimeRange, listActivityLogs } from "./query.js";
import { ServiceUnavailableError, ValidationError } from "../errors.js";

test("assertActivityLogTimeRange rejects inverted and oversized ranges", () => {
  const from = new Date("2026-01-10T00:00:00.000Z");
  const to = new Date("2026-01-01T00:00:00.000Z");
  assert.throws(() => assertActivityLogTimeRange(from, to), ValidationError);

  const wideTo = new Date("2026-01-18T00:00:01.000Z");
  assert.throws(
    () => assertActivityLogTimeRange(new Date("2026-01-10T00:00:00.000Z"), wideTo),
    ValidationError,
  );

  assert.doesNotThrow(() =>
    assertActivityLogTimeRange(
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2026-01-08T00:00:00.000Z"),
    ),
  );
});

test("listActivityLogs throws 503 when logs store is unset", async () => {
  await assert.rejects(
    () =>
      listActivityLogs({
        page: 1,
        limit: 50,
        from: new Date("2026-01-01T00:00:00.000Z"),
        to: new Date("2026-01-02T00:00:00.000Z"),
      }),
    (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableError);
      assert.equal(error.statusCode, 503);
      assert.equal(error.code, ACTIVITY_LOGS_UNAVAILABLE_CODE);
      return true;
    },
  );
});
