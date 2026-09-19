import { z } from "zod";
import { paginatedQuerySchema } from "../../lib/pagination.schema.js";

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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createFoodMenuItemBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    priceCents: z.number().int().positive().max(5_000_000),
    category: z.string().trim().max(80).optional(),
    available: z.boolean().optional().default(true),
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

export const foodMenuItemIdParamsSchema = z.object({ id: z.string().min(1) }).strict();

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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
});

export const listAdminFoodOrdersQuerySchema = paginatedQuerySchema.extend({
  status: foodOrderStatusSchema.optional(),
});

export const patchFoodOrderBodySchema = z
  .object({
    status: foodOrderStatusSchema,
  })
  .strict();

export const foodOrderIdParamsSchema = z.object({ id: z.string().min(1) }).strict();

export type FoodMenuItemDto = z.infer<typeof foodMenuItemDtoSchema>;
export type CreateFoodMenuItemBody = z.infer<typeof createFoodMenuItemBodySchema>;
export type PatchFoodMenuItemBody = z.infer<typeof patchFoodMenuItemBodySchema>;
export type CreateFoodOrderBody = z.infer<typeof createFoodOrderBodySchema>;
export type FoodOrderDto = z.infer<typeof foodOrderDtoSchema>;
export type ListAdminFoodOrdersQuery = z.infer<typeof listAdminFoodOrdersQuerySchema>;
export type PatchFoodOrderBody = z.infer<typeof patchFoodOrderBodySchema>;

export function assertAdjacentFoodStatus(
  from: "pending" | "preparing" | "ready",
  to: "pending" | "preparing" | "ready",
): boolean {
  return (from === "pending" && to === "preparing") || (from === "preparing" && to === "ready");
}
