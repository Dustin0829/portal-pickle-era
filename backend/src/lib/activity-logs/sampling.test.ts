import assert from "node:assert/strict";
import test from "node:test";
import type { Request } from "express";
import {
  isActivityLogsHttpPath,
  shouldPersistHttpActivity,
  shouldSkipHttpActivityCapture,
} from "./sampling.js";

function mockReq(method: string): Request {
  return { method } as Request;
}

test("shouldSkipHttpActivityCapture skips OPTIONS and listed paths", () => {
  assert.equal(shouldSkipHttpActivityCapture("/examples", "OPTIONS"), true);
  assert.equal(shouldSkipHttpActivityCapture("/health", "GET"), true);
  assert.equal(shouldSkipHttpActivityCapture("/health/db", "GET"), true);
  assert.equal(shouldSkipHttpActivityCapture("/docs", "GET"), true);
  assert.equal(shouldSkipHttpActivityCapture("/openapi.json", "GET"), true);
  assert.equal(shouldSkipHttpActivityCapture("/admin/queues", "GET"), true);
  assert.equal(shouldSkipHttpActivityCapture("/admin/queues/api/queues", "GET"), true);
  assert.equal(shouldSkipHttpActivityCapture("/favicon.ico", "GET"), true);
  assert.equal(shouldSkipHttpActivityCapture("/robots.txt", "GET"), true);
  assert.equal(shouldSkipHttpActivityCapture("/examples", "GET"), false);
});

test("isActivityLogsHttpPath matches prefix", () => {
  assert.equal(isActivityLogsHttpPath("/admin/activity-logs"), true);
  assert.equal(isActivityLogsHttpPath("/admin/activity-logs/abc"), true);
  assert.equal(shouldSkipHttpActivityCapture("/admin/activity-logs", "GET"), true);
  assert.equal(shouldSkipHttpActivityCapture("/admin/activity-logs/abc", "GET"), true);
  assert.equal(isActivityLogsHttpPath("/examples"), false);
});

test("shouldPersistHttpActivity skips fast successful GETs", () => {
  assert.equal(shouldPersistHttpActivity(mockReq("GET"), "/examples", 200, 100), false);
  assert.equal(shouldPersistHttpActivity(mockReq("GET"), "/examples", 404, 100), true);
  assert.equal(shouldPersistHttpActivity(mockReq("GET"), "/examples", 200, 6000), true);
});

test("shouldPersistHttpActivity always persists mutations", () => {
  assert.equal(shouldPersistHttpActivity(mockReq("POST"), "/examples", 201, 50), true);
});

test("shouldPersistHttpActivity skips activity log reads and bull board success", () => {
  assert.equal(shouldPersistHttpActivity(mockReq("GET"), "/admin/activity-logs", 200, 100), false);
  assert.equal(shouldPersistHttpActivity(mockReq("GET"), "/admin/queues", 200, 100), false);
});
