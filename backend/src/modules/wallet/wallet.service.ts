import { prisma } from "../../app/prisma.js";
import { NotFoundError, UnauthorizedError } from "../../lib/errors.js";
import { buildPaginationMeta, pageToOffset, parseSortField } from "../../lib/pagination.js";
import { createPresignedDownload } from "../../lib/storage/s3.js";
import type { AuthUser } from "../auth/auth.constants.js";
import {
  assertPendingTransitionApplied,
  toAdminWalletTopUpDto,
  toWalletTopUpDto,
  walletTopUpAdminSelect,
  walletTopUpPublicSelect,
} from "./wallet.mapper.js";
import type {
  CreateWalletTopUpBody,
  ListAdminTopUpsQuery,
  PatchTopUpBody,
  WalletDto,
} from "./wallet.schema.js";

const topUpSortFields = ["createdAt"] as const;
const RECENT_TOP_UPS_LIMIT = 20;

export async function getMyWallet(authUser: AuthUser | undefined): Promise<WalletDto> {
  if (!authUser) {
    throw new UnauthorizedError();
  }

  const wallet = await prisma.wallet.upsert({
    where: { userId: authUser.id },
    create: { userId: authUser.id, balanceCents: 0 },
    update: {},
    select: { balanceCents: true },
  });

  const topUps = await prisma.walletTopUp.findMany({
    where: { userId: authUser.id },
    select: walletTopUpPublicSelect,
    orderBy: { createdAt: "desc" },
    take: RECENT_TOP_UPS_LIMIT,
  });

  return {
    balanceCents: wallet.balanceCents,
    topUps: topUps.map(toWalletTopUpDto),
  };
}

export async function createMyTopUp(authUser: AuthUser | undefined, body: CreateWalletTopUpBody) {
  if (!authUser) {
    throw new UnauthorizedError();
  }

  await prisma.wallet.upsert({
    where: { userId: authUser.id },
    create: { userId: authUser.id, balanceCents: 0 },
    update: {},
    select: { id: true },
  });

  const row = await prisma.walletTopUp.create({
    data: {
      userId: authUser.id,
      amountCents: body.amountCents,
      receiptName: body.receiptName?.trim() || null,
      receiptKey: body.receiptKey.trim(),
      receiptMimeType: body.receiptMimeType?.trim() || null,
      status: "pending",
    },
    select: walletTopUpPublicSelect,
  });

  return toWalletTopUpDto(row);
}

export async function listAdminTopUps(query: ListAdminTopUpsQuery) {
  const sortField = parseSortField(query.sort, topUpSortFields, "createdAt");
  const where = query.status ? { status: query.status } : {};

  const [rows, total] = await Promise.all([
    prisma.walletTopUp.findMany({
      where,
      select: walletTopUpAdminSelect,
      orderBy: { [sortField]: query.order },
      skip: pageToOffset(query.page, query.limit),
      take: query.limit,
    }),
    prisma.walletTopUp.count({ where }),
  ]);

  return {
    items: rows.map(toAdminWalletTopUpDto),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function getTopUpReceiptUrl(id: string) {
  const row = await prisma.walletTopUp.findUnique({
    where: { id },
    select: { id: true, receiptKey: true },
  });
  if (!row) {
    throw new NotFoundError("Top-up not found");
  }
  if (!row.receiptKey) {
    throw new NotFoundError("Receipt not found");
  }

  return createPresignedDownload({ key: row.receiptKey });
}

export async function patchTopUpStatus(id: string, body: PatchTopUpBody) {
  if (body.status === "rejected") {
    return rejectTopUp(id);
  }
  return approveTopUp(id);
}

async function rejectTopUp(id: string) {
  const existing = await prisma.walletTopUp.findUnique({
    where: { id },
    select: walletTopUpAdminSelect,
  });
  if (!existing) {
    throw new NotFoundError("Top-up not found");
  }

  const updated = await prisma.walletTopUp.updateMany({
    where: { id, status: "pending" },
    data: { status: "rejected" },
  });

  assertPendingTransitionApplied(updated.count);

  const row = await prisma.walletTopUp.findUniqueOrThrow({
    where: { id },
    select: walletTopUpAdminSelect,
  });
  return toAdminWalletTopUpDto(row);
}

/**
 * Credit wallet only on pending→approved inside a transaction (conditional update).
 */
export async function approveTopUp(id: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.walletTopUp.findUnique({
      where: { id },
      select: { id: true, userId: true, amountCents: true, status: true },
    });
    if (!existing) {
      throw new NotFoundError("Top-up not found");
    }

    const updated = await tx.walletTopUp.updateMany({
      where: { id, status: "pending" },
      data: { status: "approved" },
    });

    assertPendingTransitionApplied(updated.count);

    await tx.wallet.upsert({
      where: { userId: existing.userId },
      create: {
        userId: existing.userId,
        balanceCents: existing.amountCents,
      },
      update: {
        balanceCents: { increment: existing.amountCents },
      },
    });

    const row = await tx.walletTopUp.findUniqueOrThrow({
      where: { id },
      select: walletTopUpAdminSelect,
    });
    return toAdminWalletTopUpDto(row);
  });
}
