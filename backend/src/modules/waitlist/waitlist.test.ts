import assert from "node:assert/strict";
import test from "node:test";
import { resolveWaitlistImageUrl } from "./waitlist.images.js";
import {
  matchUserImageKey,
  normalizeWaitlistEmail,
  toWaitlistEntryDto,
} from "./waitlist.mapper.js";
import { createWaitlistBodySchema, listWaitlistQuerySchema } from "./waitlist.schema.js";

test("waitlist schema parses create body and defaults source", () => {
  const parsed = createWaitlistBodySchema.parse({
    email: "Player@Example.com",
    name: "Ada",
  });
  assert.equal(parsed.email, "Player@Example.com");
  assert.equal(parsed.name, "Ada");
  assert.equal(parsed.source, "newsletter");
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

test("waitlist schema parses booking source", () => {
  const parsed = createWaitlistBodySchema.parse({
    email: "book@example.com",
    name: "Kai",
    source: "booking",
  });
  assert.equal(parsed.source, "booking");
});

test("waitlist schema still accepts join_club source", () => {
  const parsed = createWaitlistBodySchema.parse({
    email: "legacy@example.com",
    source: "join_club",
  });
  assert.equal(parsed.source, "join_club");
});

test("waitlist list query rejects short search", () => {
  assert.equal(listWaitlistQuerySchema.safeParse({ search: "a" }).success, false);
});

test("normalizeWaitlistEmail lowercases and trims", () => {
  assert.equal(normalizeWaitlistEmail("  Ada@Example.COM "), "ada@example.com");
});

test("waitlist mapper serializes timestamps and defaults imageUrl null", () => {
  const dto = toWaitlistEntryDto({
    id: "wl_1",
    name: "Ada",
    email: "ada@example.com",
    phone: null,
    source: "booking",
    createdAt: new Date("2026-01-15T12:00:00.000Z"),
    updatedAt: new Date("2026-01-16T12:00:00.000Z"),
  });
  assert.equal(dto.createdAt, "2026-01-15T12:00:00.000Z");
  assert.equal(dto.updatedAt, "2026-01-16T12:00:00.000Z");
  assert.equal(dto.source, "booking");
  assert.equal(dto.imageUrl, null);
});

test("waitlist mapper includes imageUrl when provided", () => {
  const dto = toWaitlistEntryDto(
    {
      id: "wl_1",
      name: "Ada",
      email: "ada@example.com",
      phone: null,
      source: "newsletter",
      createdAt: new Date("2026-01-15T12:00:00.000Z"),
      updatedAt: new Date("2026-01-16T12:00:00.000Z"),
    },
    "https://cdn.example.com/ada.png",
  );
  assert.equal(dto.imageUrl, "https://cdn.example.com/ada.png");
});

test("matchUserImageKey is case-insensitive and returns null when missing", () => {
  const users = [{ email: "Ada@Example.com", image: "uploads/ada.png" }];
  assert.equal(matchUserImageKey("ada@example.com", users), "uploads/ada.png");
  assert.equal(matchUserImageKey("other@example.com", users), null);
  assert.equal(
    matchUserImageKey("ada@example.com", [{ email: "ada@example.com", image: null }]),
    null,
  );
});

test("resolveWaitlistImageUrl returns null without key", async () => {
  assert.equal(await resolveWaitlistImageUrl(null), null);
});

test("resolveWaitlistImageUrl returns url on success", async () => {
  const url = await resolveWaitlistImageUrl("uploads/ada.png", async () => ({
    url: "https://cdn.example.com/ada.png",
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  }));
  assert.equal(url, "https://cdn.example.com/ada.png");
});

test("resolveWaitlistImageUrl returns null on download failure", async () => {
  const url = await resolveWaitlistImageUrl("uploads/ada.png", async () => {
    throw new Error("boom");
  });
  assert.equal(url, null);
});
