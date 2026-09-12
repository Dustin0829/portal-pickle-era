import assert from "node:assert/strict";
import test from "node:test";
import { resolveAdminToolsAccess } from "./adminBasicAuth.js";

test("development mounts admin tools without credentials", () => {
  const access = resolveAdminToolsAccess({
    nodeEnv: "development",
  });

  assert.equal(access.mounted, true);
  assert.equal(access.protected, false);
});

test("production hides admin tools without credentials", () => {
  const access = resolveAdminToolsAccess({
    nodeEnv: "production",
  });

  assert.equal(access.mounted, false);
  assert.equal(access.protected, false);
});

test("production mounts and protects admin tools when basic auth is configured", () => {
  const access = resolveAdminToolsAccess({
    nodeEnv: "production",
    user: "ops",
    password: "secret",
  });

  assert.equal(access.configured, true);
  assert.equal(access.mounted, true);
  assert.equal(access.protected, true);
});

test("development with credentials still protects admin tools", () => {
  const access = resolveAdminToolsAccess({
    nodeEnv: "development",
    user: "ops",
    password: "secret",
  });

  assert.equal(access.mounted, true);
  assert.equal(access.protected, true);
});
