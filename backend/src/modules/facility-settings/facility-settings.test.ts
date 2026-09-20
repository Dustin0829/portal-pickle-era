import assert from "node:assert/strict";
import test from "node:test";
import { toFacilitySettingsDto, parseOpenPlaySessions } from "./facility-settings.mapper.js";
import {
  FACILITY_SETTINGS_ID,
  patchFacilitySettingsBodySchema,
  openPlaySessionSchema,
} from "./facility-settings.schema.js";

test("openPlaySessionSchema rejects invalid hour and non-positive duration", () => {
  assert.equal(
    openPlaySessionSchema.safeParse({ slotId: "07:00", hour: 24, durationHours: 2 }).success,
    false,
  );
  assert.equal(
    openPlaySessionSchema.safeParse({ slotId: "07:00", hour: 7, durationHours: 0 }).success,
    false,
  );
  assert.equal(
    openPlaySessionSchema.safeParse({ slotId: "07:00", hour: 7, durationHours: 2 }).success,
    true,
  );
});

test("patchFacilitySettingsBodySchema rejects empty payment methods", () => {
  const result = patchFacilitySettingsBodySchema.safeParse({ paymentMethods: [] });
  assert.equal(result.success, false);
});

test("patchFacilitySettingsBodySchema rejects empty open play sessions", () => {
  const result = patchFacilitySettingsBodySchema.safeParse({ openPlaySessions: [] });
  assert.equal(result.success, false);
});

test("patchFacilitySettingsBodySchema rejects non-positive plan prices", () => {
  const result = patchFacilitySettingsBodySchema.safeParse({
    planPrices: { court: 0 },
  });
  assert.equal(result.success, false);
});

test("patchFacilitySettingsBodySchema accepts partial valid update", () => {
  const result = patchFacilitySettingsBodySchema.safeParse({
    planPrices: { court: 350 },
    preSignup: true,
  });
  assert.equal(result.success, true);
});

test("parseOpenPlaySessions filters invalid entries", () => {
  const sessions = parseOpenPlaySessions([
    { slotId: "07:00", hour: 7, durationHours: 2 },
    { slotId: "bad", hour: 99, durationHours: 2 },
  ]);
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0]?.slotId, "07:00");
});

test("toFacilitySettingsDto maps prices methods and qr urls", () => {
  const updatedAt = new Date("2026-09-20T00:00:00.000Z");
  const dto = toFacilitySettingsDto(
    {
      id: FACILITY_SETTINGS_ID,
      courtPricePesos: 300,
      openPlayPricePesos: 250,
      clinicPricePesos: 500,
      openPlaySessions: [{ slotId: "07:00", hour: 7, durationHours: 2 }],
      preSignup: false,
      updatedAt,
      paymentMethods: [
        {
          id: "pm-1",
          label: "GCash",
          name: "Pickle Era",
          number: "0917 850 0107",
          qrImageKey: "uploads/qr.png",
          sortOrder: 0,
        },
      ],
    },
    new Map([["pm-1", "https://cdn.example.com/qr.png"]]),
  );

  assert.equal(dto.planPrices.court, 300);
  assert.equal(dto.paymentMethods[0]?.qrImageUrl, "https://cdn.example.com/qr.png");
  assert.equal(dto.paymentMethods[0]?.qrImageKey, "uploads/qr.png");
  assert.equal(dto.openPlaySessions[0]?.hour, 7);
  assert.equal(dto.updatedAt, updatedAt.toISOString());
});
