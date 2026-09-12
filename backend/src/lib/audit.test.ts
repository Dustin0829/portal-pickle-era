import assert from "node:assert/strict";
import test from "node:test";
import { writeAuditLog } from "./audit.js";

test("writeAuditLog shapes create payload", async () => {
  const calls: unknown[] = [];
  const tx = {
    auditLog: {
      create: async (args: unknown) => {
        calls.push(args);
        return { id: "audit-1" };
      },
    },
  };

  await writeAuditLog(tx as never, {
    actorId: null,
    action: "example.created",
    resource: "example:abc",
    metadata: { source: "test" },
  });

  assert.deepEqual(calls[0], {
    data: {
      actorId: null,
      action: "example.created",
      resource: "example:abc",
      metadata: { source: "test" },
    },
  });
});
