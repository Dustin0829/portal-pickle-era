import assert from "node:assert/strict";
import test from "node:test";
import { applyActivityLogTimescalePolicies } from "./writer.js";

test("timescale policy failure does not throw", async () => {
  await assert.doesNotReject(async () => {
    await applyActivityLogTimescalePolicies(async () => {
      throw new Error("not timescale");
    });
  });
});
