import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { activityBufferSize, resetActivityBufferForTests } from "./buffer.js";
import { activityHttpCapture } from "./http-capture.js";

async function request(app: express.Express, method: string, path: string) {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const res = await fetch(`http://127.0.0.1:${address.port}${path}`, { method });
  await res.arrayBuffer();
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  return res;
}

test("activityHttpCapture skips /health", async () => {
  resetActivityBufferForTests();
  const app = express();
  app.use(activityHttpCapture);
  app.get("/health", (_req, res) => {
    res.json({ success: true });
  });
  app.post("/examples", express.json(), (_req, res) => {
    res.status(201).json({ success: true });
  });

  await request(app, "GET", "/health");
  assert.equal(activityBufferSize(), 0);

  await request(app, "POST", "/examples");
  assert.equal(activityBufferSize(), 1);
});
