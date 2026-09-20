import type { Prisma } from "../../generated/prisma/client.js";
import type {
  FacilityPaymentMethodDto,
  FacilitySettingsDto,
  OpenPlaySession,
} from "./facility-settings.schema.js";
import { openPlaySessionSchema } from "./facility-settings.schema.js";

export const facilitySettingsSelect = {
  id: true,
  courtPricePesos: true,
  openPlayPricePesos: true,
  clinicPricePesos: true,
  openPlaySessions: true,
  preSignup: true,
  updatedAt: true,
  paymentMethods: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      label: true,
      name: true,
      number: true,
      qrImageKey: true,
      sortOrder: true,
    },
  },
} satisfies Prisma.FacilitySettingsSelect;

type SettingsRow = Prisma.FacilitySettingsGetPayload<{ select: typeof facilitySettingsSelect }>;

export function parseOpenPlaySessions(value: unknown): OpenPlaySession[] {
  if (!Array.isArray(value)) return [];
  const out: OpenPlaySession[] = [];
  for (const item of value) {
    const result = openPlaySessionSchema.safeParse(item);
    if (result.success) out.push(result.data);
  }
  return out;
}

export function toFacilitySettingsDto(
  row: SettingsRow,
  qrUrls: Map<string, string | null>,
): FacilitySettingsDto {
  const sessions = parseOpenPlaySessions(row.openPlaySessions);
  const paymentMethods: FacilityPaymentMethodDto[] = row.paymentMethods.map((method) => ({
    id: method.id,
    label: method.label,
    name: method.name,
    number: method.number,
    qrImageKey: method.qrImageKey,
    qrImageUrl: qrUrls.get(method.id) ?? null,
    sortOrder: method.sortOrder,
  }));

  return {
    id: row.id,
    planPrices: {
      court: row.courtPricePesos,
      openPlay: row.openPlayPricePesos,
      clinic: row.clinicPricePesos,
    },
    openPlaySessions: sessions,
    paymentMethods,
    preSignup: row.preSignup,
    updatedAt: row.updatedAt.toISOString(),
  };
}
