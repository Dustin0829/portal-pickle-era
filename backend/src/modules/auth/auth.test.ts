import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { isUserRole } from "./auth.constants.js";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  resetPasswordBodySchema,
  signupBodySchema,
} from "./auth.schema.js";
import { normalizeEmail, toUserDto } from "./auth.mapper.js";
import { toAuthUser } from "./auth.service.js";

test("signup schema requires password length 8+", () => {
  assert.equal(
    signupBodySchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    }).success,
    false,
  );
  assert.equal(
    signupBodySchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "password1",
    }).success,
    true,
  );
});

test("login schema requires email and password", () => {
  assert.equal(loginBodySchema.safeParse({ email: "x", password: "y" }).success, false);
  assert.equal(
    loginBodySchema.safeParse({ email: "ada@example.com", password: "password1" }).success,
    true,
  );
});

test("normalizeEmail lowercases", () => {
  assert.equal(normalizeEmail("  Ada@Example.COM "), "ada@example.com");
});

test("better-auth password hash verifies", async () => {
  const hash = await hashPassword("password1");
  assert.equal(await verifyPassword({ hash, password: "password1" }), true);
  assert.equal(await verifyPassword({ hash, password: "wrong" }), false);
});

test("user mapper omits secrets", () => {
  const dto = toUserDto({
    id: "u1",
    name: "Ada",
    email: "ada@example.com",
    role: "student",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  });
  assert.equal(dto.email, "ada@example.com");
  assert.equal("passwordHash" in dto, false);
});

test("toAuthUser defaults unknown role to student", () => {
  assert.equal(toAuthUser({ id: "1", name: "A", email: "a@b.co", role: "admin" }).role, "admin");
  assert.equal(toAuthUser({ id: "1", name: "A", email: "a@b.co", role: "nope" }).role, "student");
  assert.equal(isUserRole("admin"), true);
  assert.equal(isUserRole("nope"), false);
});

test("patch me schema is name-only strict", async () => {
  const { patchMeBodySchema } = await import("./auth.schema.js");
  assert.equal(patchMeBodySchema.safeParse({ name: "New" }).success, true);
  assert.equal(patchMeBodySchema.safeParse({ name: "New", role: "admin" }).success, false);
});

test("forgot password schema requires email", () => {
  assert.equal(forgotPasswordBodySchema.safeParse({ email: "x" }).success, false);
  assert.equal(forgotPasswordBodySchema.safeParse({ email: "ada@example.com" }).success, true);
});

test("reset password schema requires token and password length 8+", () => {
  assert.equal(
    resetPasswordBodySchema.safeParse({ token: "t", newPassword: "short" }).success,
    false,
  );
  assert.equal(
    resetPasswordBodySchema.safeParse({ token: "", newPassword: "password1" }).success,
    false,
  );
  assert.equal(
    resetPasswordBodySchema.safeParse({ token: "t", newPassword: "password1" }).success,
    true,
  );
});
