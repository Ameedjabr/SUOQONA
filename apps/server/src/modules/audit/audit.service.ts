import prisma from "../../lib/prisma";

export interface AuditEntry {
  actorUserId: string | null;
  action: string;        // e.g. "UPDATE", "CREATE", "DELETE"
  entityType: string;    // e.g. "Product", "Order", "InventoryItem"
  entityId: string;
  before?: object | null;
  after?: object | null;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAuditLog(entry: AuditEntry) {
  return prisma.auditLog.create({
    data: {
      actorUserId: entry.actorUserId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      before: entry.before ?? undefined,
      after: entry.after ?? undefined,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    },
  });
}

export async function getAuditLogs(params: {
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 30;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.entityType) where.entityType = params.entityType;
  if (params.entityId) where.entityId = params.entityId;
  if (params.actorUserId) where.actorUserId = params.actorUserId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, fullName: true, email: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
