import assert from "node:assert/strict";
import test from "node:test";
import type { Request } from "express";
import express from "express";
import rateLimit from "express-rate-limit";
import { shouldSkipHttpRateLimit } from "./http-rate-limit.js";

function req(partial: Partial<Request>): Request {
  return {
    method: "GET",
    originalUrl: "/",
    url: "/",
    path: "/",
    ...partial,
  } as Request;
}

test("shouldSkipHttpRateLimit skips health and activity-log GETs", () => {
  assert.equal(shouldSkipHttpRateLimit(req({ method: "OPTIONS", originalUrl: "/examples" })), true);
  assert.equal(shouldSkipHttpRateLimit(req({ method: "GET", originalUrl: "/health" })), true);
  assert.equal(shouldSkipHttpRateLimit(req({ method: "GET", originalUrl: "/health/db" })), true);
  assert.equal(
    shouldSkipHttpRateLimit(req({ method: "GET", originalUrl: "/admin/activity-logs?from=1" })),
    true,
  );
  assert.equal(
    shouldSkipHttpRateLimit(req({ method: "GET", originalUrl: "/admin/activity-logs/abc" })),
    true,
  );
  assert.equal(shouldSkipHttpRateLimit(req({ method: "GET", originalUrl: "/examples" })), false);
});

test("rate limiter returns JSON 429 on /examples", async () => {
  const app = express();
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 1,
      skip: shouldSkipHttpRateLimit,
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          message: "Too many requests. Please try again shortly.",
        });
      },
    }),
  );
  app.get("/examples", (_req, res) => {
    res.json({ success: true });
  });

  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const base = `http://127.0.0.1:${address.port}`;

  const first = await fetch(`${base}/examples`);
  assert.equal(first.status, 200);
  const second = await fetch(`${base}/examples`);
  assert.equal(second.status, 429);
  assert.deepEqual(await second.json(), {
    success: false,
    message: "Too many requests. Please try again shortly.",
  });

  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});
