import { z } from "zod";

export const openPlaySessionSchema = z
  .object({
    slotId: z.string().min(1),
    hour: z.number().int().min(0).max(23),
    durationHours: z.number().int().positive().max(12),
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
    court: z.number().positive(),
    openPlay: z.number().positive(),
    clinic: z.number().positive(),
  })
  .strict();

export const facilitySettingsDtoSchema = z.object({
  id: z.string(),
  planPrices: facilityPlanPricesSchema,
  openPlaySessions: z.array(openPlaySessionSchema).min(1),
  paymentMethods: z.array(facilityPaymentMethodDtoSchema).min(1),
  preSignup: z.boolean(),
  updatedAt: z.string(),
});

export const facilityPaymentMethodInputSchema = z
  .object({
    id: z.string().min(1).optional(),
    label: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(120),
    number: z.string().trim().min(1).max(80),
    qrImageKey: z.string().trim().max(512).nullable().optional(),
  })
  .strict();

export const patchFacilitySettingsBodySchema = z
  .object({
    planPrices: facilityPlanPricesSchema.partial().optional(),
    openPlaySessions: z.array(openPlaySessionSchema).min(1).max(24).optional(),
    paymentMethods: z
      .array(facilityPaymentMethodInputSchema)
      .min(1)
      .max(20)
      .optional(),
    preSignup: z.boolean().optional(),
  })
  .strict();

export type OpenPlaySessionDto = z.infer<typeof openPlaySessionSchema>;
export type FacilityPaymentMethodDto = z.infer<
  typeof facilityPaymentMethodDtoSchema
>;
export type FacilitySettingsDto = z.infer<typeof facilitySettingsDtoSchema>;
export type PatchFacilitySettingsBody = z.infer<
  typeof patchFacilitySettingsBodySchema
>;
