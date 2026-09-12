import assert from "node:assert/strict";
import test from "node:test";
import { ServiceUnavailableError } from "./errors.js";

test("ServiceUnavailableError uses status 503", () => {
  const error = new ServiceUnavailableError();
  assert.equal(error.statusCode, 503);
  assert.equal(error.message, "Service unavailable");
  assert.equal(error.code, undefined);

  const coded = new ServiceUnavailableError(
    "Activity log store is unavailable",
    "ACTIVITY_LOGS_UNAVAILABLE",
  );
  assert.equal(coded.statusCode, 503);
  assert.equal(coded.code, "ACTIVITY_LOGS_UNAVAILABLE");
});
