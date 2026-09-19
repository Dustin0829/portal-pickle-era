import { z } from "zod";
import {
  nonEmptyString,
  paginatedQuerySchema,
} from "@/api/schema/primitives.schema";

export const foodOrderStatusSchema = z.enum(["pending", "preparing", "ready"]);
export const foodPayModeSchema = z.enum(["wallet", "counter"]);

export const foodMenuItemDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceCents: z.number().int().nonnegative(),
  category: z.string().nullable(),
  available: z.boolean(),
  imageKey: z.string().nullable(),
  imageMimeType: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createFoodMenuItemBodySchema = z
  .object({
    name: nonEmptyString.max(120),
    priceCents: z.number().int().positive().max(5_000_000),
    category: z.string().trim().max(80).optional(),
    available: z.boolean().optional(),
    imageKey: z.string().trim().max(512).optional(),
    imageMimeType: z.string().trim().max(120).optional(),
  })
  .strict();

export const patchFoodMenuItemBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    priceCents: z.number().int().positive().max(5_000_000).optional(),
    category: z.string().trim().max(80).nullable().optional(),
    available: z.boolean().optional(),
    imageKey: z.string().trim().max(512).nullable().optional(),
    imageMimeType: z.string().trim().max(120).nullable().optional(),
  })
  .strict();

export const createFoodOrderBodySchema = z
  .object({
    lines: z
      .array(
        z
          .object({
            menuItemId: z.string().min(1),
            quantity: z.number().int().positive().max(50),
          })
          .strict(),
      )
      .min(1)
      .max(40),
    notes: z.string().trim().max(500).optional(),
    payMode: foodPayModeSchema,
  })
  .strict();

export const foodOrderLineDtoSchema = z.object({
  id: z.string(),
  menuItemId: z.string().nullable(),
  name: z.string(),
  unitPriceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

export const foodOrderDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: foodOrderStatusSchema,
  payMode: foodPayModeSchema,
  totalCents: z.number().int().nonnegative(),
  notes: z.string().nullable(),
  lines: z.array(foodOrderLineDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
});

export const listAdminFoodOrdersQuerySchema = paginatedQuerySchema.extend({
  status: foodOrderStatusSchema.optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const patchFoodOrderBodySchema = z
  .object({
    status: foodOrderStatusSchema,
  })
  .strict();

/** Admin form: pesos input converted to cents before POST. */
export const createFoodMenuItemFormSchema = z
  .object({
    name: nonEmptyString.max(120),
    pricePesos: z.coerce
      .number()
      .finite("Enter a price in pesos")
      .min(1, "Price must be at least ₱1")
      .max(50_000, "Price cannot exceed ₱50,000"),
    category: z.string().trim().max(80).optional(),
    available: z.boolean().default(true),
  })
  .strict();

export type FoodOrderStatus = z.infer<typeof foodOrderStatusSchema>;
export type FoodPayMode = z.infer<typeof foodPayModeSchema>;
export type FoodMenuItemDto = z.infer<typeof foodMenuItemDtoSchema>;
export type CreateFoodMenuItemBody = z.infer<
  typeof createFoodMenuItemBodySchema
>;
export type PatchFoodMenuItemBody = z.infer<typeof patchFoodMenuItemBodySchema>;
export type CreateFoodOrderBody = z.infer<typeof createFoodOrderBodySchema>;
export type FoodOrderDto = z.infer<typeof foodOrderDtoSchema>;
export type ListAdminFoodOrdersQuery = z.input<
  typeof listAdminFoodOrdersQuerySchema
>;
export type PatchFoodOrderBody = z.infer<typeof patchFoodOrderBodySchema>;
export type CreateFoodMenuItemFormValues = z.infer<
  typeof createFoodMenuItemFormSchema
>;
