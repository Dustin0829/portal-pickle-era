import type { Prisma } from "../generated/prisma/client.js";

export type WriteAuditLogInput = {
  actorId?: string | null;
  action: string;
  resource: string;
  metadata?: Prisma.InputJsonValue;
};

export async function writeAuditLog(tx: Prisma.TransactionClient, input: WriteAuditLogInput) {
  await tx.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      resource: input.resource,
      metadata: input.metadata ?? {},
    },
  });
}
