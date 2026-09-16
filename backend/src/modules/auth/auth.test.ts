import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "./auth.crypto.js";
import { loginBodySchema, signupBodySchema } from "./auth.schema.js";
import { normalizeEmail, toUserDto } from "./auth.mapper.js";

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

test("password hash verifies", async () => {
  const hash = await hashPassword("password1");
  assert.equal(await verifyPassword("password1", hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
});

test("user mapper omits password", () => {
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
