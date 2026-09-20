import { z } from "zod";

export const FACILITY_SETTINGS_ID = "default" as const;

export const openPlaySessionSchema = z
  .object({
    slotId: z.string().trim().min(1).max(16),
    hour: z.number().int().min(0).max(23),
    durationHours: z.number().int().positive().max(12),
  })
  .strict();

export const facilityPaymentMethodInputSchema = z
  .object({
    id: z.string().trim().min(1).max(64).optional(),
    label: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(120),
    number: z.string().trim().min(1).max(80),
    qrImageKey: z.string().trim().max(512).nullable().optional(),
  })
  .strict();

export const facilityPaymentMethodDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  name: z.string(),
  number: z.string(),
  qrImageKey: z.string().nullable(),
  qrImageUrl: z.string().nullable(),
  sortOrder: z.number().int().nonnegative(),
});

export const facilityPlanPricesSchema = z
  .object({
    court: z.number().positive().max(100_000),
    openPlay: z.number().positive().max(100_000),
    clinic: z.number().positive().max(100_000),
  })
  .strict();

export const facilitySettingsDtoSchema = z.object({
  id: z.string(),
  planPrices: facilityPlanPricesSchema,
  openPlaySessions: z.array(openPlaySessionSchema).min(1),
  paymentMethods: z.array(facilityPaymentMethodDtoSchema).min(1),
  preSignup: z.boolean(),
  updatedAt: z.string().datetime(),
});

export const patchFacilitySettingsBodySchema = z
  .object({
    planPrices: facilityPlanPricesSchema.partial().optional(),
    openPlaySessions: z.array(openPlaySessionSchema).min(1).max(24).optional(),
    paymentMethods: z.array(facilityPaymentMethodInputSchema).min(1).max(20).optional(),
    preSignup: z.boolean().optional(),
  })
  .strict()
  .refine(
    (body) =>
      body.planPrices !== undefined ||
      body.openPlaySessions !== undefined ||
      body.paymentMethods !== undefined ||
      body.preSignup !== undefined,
    { message: "At least one field is required" },
  );

export type OpenPlaySession = z.infer<typeof openPlaySessionSchema>;
export type FacilityPaymentMethodInput = z.infer<typeof facilityPaymentMethodInputSchema>;
export type FacilityPaymentMethodDto = z.infer<typeof facilityPaymentMethodDtoSchema>;
export type FacilityPlanPrices = z.infer<typeof facilityPlanPricesSchema>;
export type FacilitySettingsDto = z.infer<typeof facilitySettingsDtoSchema>;
export type PatchFacilitySettingsBody = z.infer<typeof patchFacilitySettingsBodySchema>;
