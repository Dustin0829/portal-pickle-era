import assert from "node:assert/strict";
import test from "node:test";
import { create{{Name}}, get{{Name}}, list{{Name}} } from "./{{name}}.service.js";

test("{{name}} service creates, lists, and reads an item", async () => {
  const created = await create{{Name}}({ label: "Generated module smoke test" });
  const items = await list{{Name}}();
  const found = await get{{Name}}(created.id);

  assert.equal(found.id, created.id);
  assert.ok(items.some((item) => item.id === created.id));
});
