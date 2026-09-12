import assert from "node:assert/strict";
import test from "node:test";
import { normalizeWaitlistEmail, toWaitlistEntryDto } from "./waitlist.mapper.js";
import { createWaitlistBodySchema, listWaitlistQuerySchema } from "./waitlist.schema.js";

test("waitlist schema parses create body and defaults source", () => {
  const parsed = createWaitlistBodySchema.parse({
    email: "Player@Example.com",
    name: "Ada",
  });
  assert.equal(parsed.email, "Player@Example.com");
  assert.equal(parsed.name, "Ada");
  assert.equal(parsed.source, "join_club");
});

test("waitlist schema rejects invalid email", () => {
  assert.equal(createWaitlistBodySchema.safeParse({ email: "not-an-email" }).success, false);
});

test("waitlist schema parses newsletter source", () => {
  const parsed = createWaitlistBodySchema.parse({
    email: "news@example.com",
    source: "newsletter",
  });
  assert.equal(parsed.source, "newsletter");
});

test("waitlist list query rejects short search", () => {
  assert.equal(listWaitlistQuerySchema.safeParse({ search: "a" }).success, false);
});

test("normalizeWaitlistEmail lowercases and trims", () => {
  assert.equal(normalizeWaitlistEmail("  Ada@Example.COM "), "ada@example.com");
});

test("waitlist mapper serializes timestamps", () => {
  const dto = toWaitlistEntryDto({
    id: "wl_1",
    name: "Ada",
    email: "ada@example.com",
    phone: null,
    source: "join_club",
    createdAt: new Date("2026-01-15T12:00:00.000Z"),
    updatedAt: new Date("2026-01-16T12:00:00.000Z"),
  });
  assert.equal(dto.createdAt, "2026-01-15T12:00:00.000Z");
  assert.equal(dto.updatedAt, "2026-01-16T12:00:00.000Z");
  assert.equal(dto.source, "join_club");
});
