import api from "@/api/client";
import {
  createFoodMenuItemBodySchema,
  createFoodOrderBodySchema,
  foodMenuItemDtoSchema,
  foodOrderDtoSchema,
  listAdminFoodOrdersQuerySchema,
  patchFoodMenuItemBodySchema,
  patchFoodOrderBodySchema,
  type CreateFoodMenuItemBody,
  type CreateFoodOrderBody,
  type ListAdminFoodOrdersQuery,
  type PatchFoodMenuItemBody,
  type PatchFoodOrderBody,
} from "@/api/features/food/food.schema";
import { paginationMetaSchema } from "@/api/schema/primitives.schema";
import { z } from "zod";

export async function listMyFoodMenu(signal?: AbortSignal) {
  const { data } = await api.get("/me/food/menu", { signal });
  const payload = data as { items?: unknown } | unknown;
  const items = Array.isArray(payload)
    ? payload
    : ((payload as { items?: unknown }).items ?? []);
  return z.array(foodMenuItemDtoSchema).parse(items);
}

export async function createMyFoodOrder(input: CreateFoodOrderBody) {
  const body = createFoodOrderBodySchema.parse(input);
  const { data } = await api.post("/me/food/orders", body);
  return foodOrderDtoSchema.parse(data);
}

export async function listAdminFoodMenu(signal?: AbortSignal) {
  const { data } = await api.get("/admin/food/menu", { signal });
  const payload = data as { items?: unknown } | unknown;
  const items = Array.isArray(payload)
    ? payload
    : ((payload as { items?: unknown }).items ?? []);
  return z.array(foodMenuItemDtoSchema).parse(items);
}

export async function createAdminFoodMenuItem(input: CreateFoodMenuItemBody) {
  const body = createFoodMenuItemBodySchema.parse(input);
  const { data } = await api.post("/admin/food/menu", body);
  return foodMenuItemDtoSchema.parse(data);
}

export async function patchAdminFoodMenuItem(
  id: string,
  input: PatchFoodMenuItemBody,
) {
  const body = patchFoodMenuItemBodySchema.parse(input);
  const { data } = await api.patch(`/admin/food/menu/${id}`, body);
  return foodMenuItemDtoSchema.parse(data);
}

export async function listAdminFoodOrders(
  query: ListAdminFoodOrdersQuery = {},
  signal?: AbortSignal,
) {
  const params = listAdminFoodOrdersQuerySchema.parse(query);
  const response = await api.get("/admin/food/orders", { params, signal });
  const payload = response.data as { items: unknown; meta?: unknown };
  const items = z.array(foodOrderDtoSchema).parse(payload.items);
  const metaRaw = payload.meta ?? (response as { meta?: unknown }).meta;
  const meta = metaRaw ? paginationMetaSchema.parse(metaRaw) : undefined;
  return { items, meta };
}

export async function patchAdminFoodOrder(
  id: string,
  input: PatchFoodOrderBody,
) {
  const body = patchFoodOrderBodySchema.parse(input);
  const { data } = await api.patch(`/admin/food/orders/${id}`, body);
  return foodOrderDtoSchema.parse(data);
}
