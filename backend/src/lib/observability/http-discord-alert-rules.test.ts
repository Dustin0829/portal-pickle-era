import assert from "node:assert/strict";
import test from "node:test";
import { shouldAlertHttp4xxForEnv } from "./http-discord-alert-rules.js";

test("development alerts on user-behavior 4xx responses", () => {
  assert.equal(
    shouldAlertHttp4xxForEnv({
      status: 422,
      nodeEnv: "development",
    }),
    true,
  );
  assert.equal(
    shouldAlertHttp4xxForEnv({
      status: 404,
      nodeEnv: "development",
    }),
    true,
  );
});

test("production skips expected user-behavior 4xx responses", () => {
  assert.equal(
    shouldAlertHttp4xxForEnv({
      status: 422,
      nodeEnv: "production",
    }),
    false,
  );
  assert.equal(
    shouldAlertHttp4xxForEnv({
      status: 429,
      nodeEnv: "production",
    }),
    true,
  );
});

test("401 is never alerted", () => {
  assert.equal(
    shouldAlertHttp4xxForEnv({
      status: 401,
      nodeEnv: "development",
    }),
    false,
  );
});
