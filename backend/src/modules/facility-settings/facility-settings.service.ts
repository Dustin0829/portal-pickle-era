import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../app/prisma.js";
import { ValidationError } from "../../lib/errors.js";
import { createPresignedDownload } from "../../lib/storage/s3.js";
import { DEFAULT_OPEN_PLAY_SESSIONS } from "../bookings/open-play-hours.js";
import {
  facilitySettingsSelect,
  parseOpenPlaySessions,
  toFacilitySettingsDto,
} from "./facility-settings.mapper.js";
import {
  FACILITY_SETTINGS_ID,
  type FacilitySettingsDto,
  type OpenPlaySession,
  type PatchFacilitySettingsBody,
} from "./facility-settings.schema.js";

/** Keep in sync with bookings.service DEFAULT_PLAN_PRICE_PESOS. */
const DEFAULT_PLAN_PRICE_PESOS = {
  court: 300,
  open_play: 250,
  clinic: 500,
} as const;

const DEFAULT_PAYMENT_METHOD = {
  label: "GCash",
  name: "Pickle Era",
  number: "0917 850 0107",
} as const;

function defaultSessions(): OpenPlaySession[] {
  return DEFAULT_OPEN_PLAY_SESSIONS.map((s) => ({
    slotId: s.slotId,
    hour: s.hour,
    durationHours: s.durationHours,
  }));
}

async function resolveQrUrl(qrImageKey: string | null): Promise<string | null> {
  if (!qrImageKey) return null;
  try {
    const result = await createPresignedDownload({ key: qrImageKey });
    return result.url;
  } catch {
    return null;
  }
}

async function toDtoWithUrls(
  row: Prisma.FacilitySettingsGetPayload<{ select: typeof facilitySettingsSelect }>,
): Promise<FacilitySettingsDto> {
  const qrUrls = new Map<string, string | null>();
  await Promise.all(
    row.paymentMethods.map(async (method) => {
      qrUrls.set(method.id, await resolveQrUrl(method.qrImageKey));
    }),
  );
  return toFacilitySettingsDto(row, qrUrls);
}

async function seedDefaults(tx: Prisma.TransactionClient = prisma) {
  return tx.facilitySettings.create({
    data: {
      id: FACILITY_SETTINGS_ID,
      courtPricePesos: DEFAULT_PLAN_PRICE_PESOS.court,
      openPlayPricePesos: DEFAULT_PLAN_PRICE_PESOS.open_play,
      clinicPricePesos: DEFAULT_PLAN_PRICE_PESOS.clinic,
      openPlaySessions: defaultSessions(),
      preSignup: false,
      paymentMethods: {
        create: [
          {
            id: randomUUID(),
            label: DEFAULT_PAYMENT_METHOD.label,
            name: DEFAULT_PAYMENT_METHOD.name,
            number: DEFAULT_PAYMENT_METHOD.number,
            qrImageKey: null,
            sortOrder: 0,
          },
        ],
      },
    },
    select: facilitySettingsSelect,
  });
}

/** Ensure singleton exists; return mapped DTO with QR URLs. */
export async function getFacilitySettings(): Promise<FacilitySettingsDto> {
  const existing = await prisma.facilitySettings.findUnique({
    where: { id: FACILITY_SETTINGS_ID },
    select: facilitySettingsSelect,
  });
  if (existing) {
    const sessions = parseOpenPlaySessions(existing.openPlaySessions);
    if (sessions.length === 0 || existing.paymentMethods.length === 0) {
      // Repair corrupt empty arrays by re-seeding missing pieces only when empty.
      if (existing.paymentMethods.length === 0) {
        await prisma.facilityPaymentMethod.create({
          data: {
            id: randomUUID(),
            settingsId: FACILITY_SETTINGS_ID,
            label: DEFAULT_PAYMENT_METHOD.label,
            name: DEFAULT_PAYMENT_METHOD.name,
            number: DEFAULT_PAYMENT_METHOD.number,
            qrImageKey: null,
            sortOrder: 0,
          },
        });
      }
      if (sessions.length === 0) {
        await prisma.facilitySettings.update({
          where: { id: FACILITY_SETTINGS_ID },
          data: { openPlaySessions: defaultSessions() },
        });
      }
      const repaired = await prisma.facilitySettings.findUniqueOrThrow({
        where: { id: FACILITY_SETTINGS_ID },
        select: facilitySettingsSelect,
      });
      return toDtoWithUrls(repaired);
    }
    return toDtoWithUrls(existing);
  }

  const created = await seedDefaults();
  return toDtoWithUrls(created);
}

/** Plan unit prices for booking totals (pesos). */
export async function getPlanPricePesos(plan: "court" | "open_play" | "clinic"): Promise<number> {
  const settings = await getFacilitySettings();
  if (plan === "court") return settings.planPrices.court;
  if (plan === "open_play") return settings.planPrices.openPlay;
  return settings.planPrices.clinic;
}

/** Open Play sessions for occupancy expansion. */
export async function getOpenPlaySessions(): Promise<OpenPlaySession[]> {
  const settings = await getFacilitySettings();
  return settings.openPlaySessions.length > 0 ? settings.openPlaySessions : defaultSessions();
}

export async function patchFacilitySettings(
  body: PatchFacilitySettingsBody,
): Promise<FacilitySettingsDto> {
  await getFacilitySettings();

  if (body.openPlaySessions) {
    for (const session of body.openPlaySessions) {
      if (session.hour + session.durationHours > 24) {
        throw new ValidationError(`Open Play session ${session.slotId} exceeds end of day`);
      }
    }
  }

  if (body.paymentMethods !== undefined && body.paymentMethods.length === 0) {
    throw new ValidationError("At least one payment method is required");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const data: Prisma.FacilitySettingsUpdateInput = {};
    if (body.planPrices) {
      if (body.planPrices.court !== undefined) {
        data.courtPricePesos = body.planPrices.court;
      }
      if (body.planPrices.openPlay !== undefined) {
        data.openPlayPricePesos = body.planPrices.openPlay;
      }
      if (body.planPrices.clinic !== undefined) {
        data.clinicPricePesos = body.planPrices.clinic;
      }
    }
    if (body.openPlaySessions) {
      data.openPlaySessions = body.openPlaySessions;
    }
    if (body.preSignup !== undefined) {
      data.preSignup = body.preSignup;
    }

    if (Object.keys(data).length > 0) {
      await tx.facilitySettings.update({
        where: { id: FACILITY_SETTINGS_ID },
        data,
      });
    }

    if (body.paymentMethods) {
      await tx.facilityPaymentMethod.deleteMany({
        where: { settingsId: FACILITY_SETTINGS_ID },
      });
      await tx.facilityPaymentMethod.createMany({
        data: body.paymentMethods.map((method, index) => ({
          id: method.id?.trim() || randomUUID(),
          settingsId: FACILITY_SETTINGS_ID,
          label: method.label,
          name: method.name,
          number: method.number,
          qrImageKey: method.qrImageKey ?? null,
          sortOrder: index,
        })),
      });
    }

    return tx.facilitySettings.findUniqueOrThrow({
      where: { id: FACILITY_SETTINGS_ID },
      select: facilitySettingsSelect,
    });
  });

  return toDtoWithUrls(updated);
}

/** Seed helper for prisma/seed.ts */
export async function ensureFacilitySettingsSeeded() {
  const existing = await prisma.facilitySettings.findUnique({
    where: { id: FACILITY_SETTINGS_ID },
    select: { id: true },
  });
  if (!existing) {
    await seedDefaults();
  }
}
