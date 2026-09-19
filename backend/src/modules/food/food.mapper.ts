import type { Prisma } from "../../generated/prisma/client.js";
import type { FoodMenuItemDto, FoodOrderDto } from "./food.schema.js";

export const foodMenuItemSelect = {
  id: true,
  name: true,
  priceCents: true,
  category: true,
  available: true,
  imageKey: true,
  imageMimeType: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.FoodMenuItemSelect;

export const foodOrderSelect = {
  id: true,
  userId: true,
  status: true,
  payMode: true,
  totalCents: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  lines: {
    select: {
      id: true,
      menuItemId: true,
      name: true,
      unitPriceCents: true,
      quantity: true,
    },
  },
  user: { select: { name: true, email: true } },
} as const satisfies Prisma.FoodOrderSelect;

type MenuRow = Prisma.FoodMenuItemGetPayload<{ select: typeof foodMenuItemSelect }>;
type OrderRow = Prisma.FoodOrderGetPayload<{ select: typeof foodOrderSelect }>;

export function toFoodMenuItemDto(row: MenuRow, imageUrl: string | null = null): FoodMenuItemDto {
  return {
    id: row.id,
    name: row.name,
    priceCents: row.priceCents,
    category: row.category,
    available: row.available,
    imageKey: row.imageKey,
    imageMimeType: row.imageMimeType,
    imageUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toFoodOrderDto(row: OrderRow, includeUser = false): FoodOrderDto {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    payMode: row.payMode,
    totalCents: row.totalCents,
    notes: row.notes,
    lines: row.lines.map((line) => ({
      id: line.id,
      menuItemId: line.menuItemId,
      name: line.name,
      unitPriceCents: line.unitPriceCents,
      quantity: line.quantity,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(includeUser ? { userName: row.user.name, userEmail: row.user.email } : {}),
  };
}
