import { prisma } from "../../app/prisma.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../lib/errors.js";
import { buildPaginationMeta, pageToOffset } from "../../lib/pagination.js";
import { createPresignedDownload } from "../../lib/storage/s3.js";
import type { AuthUser } from "../auth/auth.constants.js";
import { applyWalletDelta } from "../wallet/wallet.service.js";
import {
  foodMenuItemSelect,
  foodOrderSelect,
  toFoodMenuItemDto,
  toFoodOrderDto,
} from "./food.mapper.js";
import {
  assertAdjacentFoodStatus,
  type CreateFoodMenuItemBody,
  type CreateFoodOrderBody,
  type ListAdminFoodOrdersQuery,
  type PatchFoodMenuItemBody,
  type PatchFoodOrderBody,
} from "./food.schema.js";

async function resolveImageUrl(imageKey: string | null): Promise<string | null> {
  if (!imageKey) return null;
  try {
    const result = await createPresignedDownload({ key: imageKey });
    return result.url;
  } catch {
    return null;
  }
}

export async function listAvailableMenu() {
  const rows = await prisma.foodMenuItem.findMany({
    where: { available: true },
    select: foodMenuItemSelect,
    orderBy: { name: "asc" },
  });
  return Promise.all(
    rows.map(async (row) => toFoodMenuItemDto(row, await resolveImageUrl(row.imageKey))),
  );
}

export async function listAdminMenu() {
  const rows = await prisma.foodMenuItem.findMany({
    select: foodMenuItemSelect,
    orderBy: { name: "asc" },
  });
  return Promise.all(
    rows.map(async (row) => toFoodMenuItemDto(row, await resolveImageUrl(row.imageKey))),
  );
}

export async function createMenuItem(body: CreateFoodMenuItemBody) {
  const row = await prisma.foodMenuItem.create({
    data: {
      name: body.name.trim(),
      priceCents: body.priceCents,
      category: body.category?.trim() || null,
      available: body.available ?? true,
      imageKey: body.imageKey?.trim() || null,
      imageMimeType: body.imageMimeType?.trim() || null,
    },
    select: foodMenuItemSelect,
  });
  return toFoodMenuItemDto(row, await resolveImageUrl(row.imageKey));
}

export async function patchMenuItem(id: string, body: PatchFoodMenuItemBody) {
  const existing = await prisma.foodMenuItem.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new NotFoundError("Menu item not found");

  const row = await prisma.foodMenuItem.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.priceCents !== undefined ? { priceCents: body.priceCents } : {}),
      ...(body.category !== undefined ? { category: body.category?.trim() || null } : {}),
      ...(body.available !== undefined ? { available: body.available } : {}),
      ...(body.imageKey !== undefined ? { imageKey: body.imageKey?.trim() || null } : {}),
      ...(body.imageMimeType !== undefined
        ? { imageMimeType: body.imageMimeType?.trim() || null }
        : {}),
    },
    select: foodMenuItemSelect,
  });
  return toFoodMenuItemDto(row, await resolveImageUrl(row.imageKey));
}

export async function createMyFoodOrder(authUser: AuthUser | undefined, body: CreateFoodOrderBody) {
  if (!authUser) throw new UnauthorizedError();
  if (body.lines.length === 0) {
    throw new ValidationError("Add at least one menu item");
  }

  const menuIds = [...new Set(body.lines.map((l) => l.menuItemId))];
  const items = await prisma.foodMenuItem.findMany({
    where: { id: { in: menuIds }, available: true },
    select: { id: true, name: true, priceCents: true },
  });
  const byId = new Map(items.map((i) => [i.id, i]));
  for (const line of body.lines) {
    if (!byId.has(line.menuItemId)) {
      throw new ValidationError("One or more menu items are unavailable");
    }
  }

  const lineData = body.lines.map((line) => {
    const item = byId.get(line.menuItemId)!;
    return {
      menuItemId: item.id,
      name: item.name,
      unitPriceCents: item.priceCents,
      quantity: line.quantity,
    };
  });
  const totalCents = lineData.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.foodOrder.create({
      data: {
        userId: authUser.id,
        payMode: body.payMode,
        totalCents,
        notes: body.notes?.trim() || null,
        status: "pending",
        lines: { create: lineData },
      },
      select: foodOrderSelect,
    });

    if (body.payMode === "wallet") {
      await applyWalletDelta(tx, {
        userId: authUser.id,
        amountCents: -totalCents,
        type: "food_debit",
        referenceType: "food_order",
        referenceId: created.id,
        insufficientFundsMessage: "Insufficient wallet balance for this food order",
      });
    }

    return created;
  });

  return toFoodOrderDto(order);
}

export async function listMyFoodOrders(authUser: AuthUser | undefined) {
  if (!authUser) throw new UnauthorizedError();
  const rows = await prisma.foodOrder.findMany({
    where: { userId: authUser.id },
    select: foodOrderSelect,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map((row) => toFoodOrderDto(row));
}

export async function listAdminFoodOrders(query: ListAdminFoodOrdersQuery) {
  const where = query.status ? { status: query.status } : {};
  const [rows, total] = await Promise.all([
    prisma.foodOrder.findMany({
      where,
      select: foodOrderSelect,
      orderBy: { createdAt: query.order },
      skip: pageToOffset(query.page, query.limit),
      take: query.limit,
    }),
    prisma.foodOrder.count({ where }),
  ]);

  return {
    items: rows.map((row) => toFoodOrderDto(row, true)),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function patchFoodOrderStatus(id: string, body: PatchFoodOrderBody) {
  const existing = await prisma.foodOrder.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!existing) throw new NotFoundError("Food order not found");
  if (!assertAdjacentFoodStatus(existing.status, body.status)) {
    throw new ValidationError(`Cannot move status from ${existing.status} to ${body.status}`);
  }

  const row = await prisma.foodOrder.update({
    where: { id },
    data: { status: body.status },
    select: foodOrderSelect,
  });
  return toFoodOrderDto(row, true);
}
