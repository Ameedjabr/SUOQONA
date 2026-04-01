import { InventoryMovementType } from "@prisma/client";
import prisma from "../../lib/prisma";
import { NotFoundError, AppError } from "../../lib/errors";

export async function getInventory(variantId: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { variantId },
    include: {
      variant: {
        include: {
          product: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });
  if (!item) throw new NotFoundError("Inventory item");
  return item;
}

export async function listInventory(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      include: {
        variant: {
          include: {
            product: { select: { id: true, title: true, slug: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.inventoryItem.count(),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── RECEIVE (restock) ─────────────────────────

export async function receiveStock(
  variantId: string,
  quantity: number,
  actorId: string,
  note?: string
) {
  if (quantity < 1) throw new AppError("Quantity must be at least 1");

  const inv = await prisma.inventoryItem.findUnique({ where: { variantId } });
  if (!inv) throw new NotFoundError("Inventory item");

  return prisma.$transaction(async (tx) => {
    await tx.inventoryMovement.create({
      data: {
        variantId,
        type: "RECEIVE",
        quantity,
        note: note || `Restocked ${quantity} units`,
        createdBy: actorId,
      },
    });

    return tx.inventoryItem.update({
      where: { variantId },
      data: { onHand: { increment: quantity } },
      include: {
        variant: {
          include: {
            product: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });
  });
}

// ── ADJUSTMENT ────────────────────────────────

export async function adjustStock(
  variantId: string,
  quantity: number, // can be positive or negative
  actorId: string,
  note?: string
) {
  const inv = await prisma.inventoryItem.findUnique({ where: { variantId } });
  if (!inv) throw new NotFoundError("Inventory item");

  const newOnHand = inv.onHand + quantity;
  if (newOnHand < 0) throw new AppError("Adjustment would result in negative stock");

  return prisma.$transaction(async (tx) => {
    await tx.inventoryMovement.create({
      data: {
        variantId,
        type: "ADJUSTMENT",
        quantity,
        note: note || `Stock adjusted by ${quantity}`,
        createdBy: actorId,
      },
    });

    return tx.inventoryItem.update({
      where: { variantId },
      data: { onHand: newOnHand },
      include: {
        variant: {
          include: {
            product: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });
  });
}

// ── Movement History ──────────────────────────

export async function getMovements(variantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = { variantId };

  const [movements, total] = await Promise.all([
    prisma.inventoryMovement.findMany({
      where,
      include: { actor: { select: { id: true, fullName: true, email: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.inventoryMovement.count({ where }),
  ]);

  return {
    movements,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Update Safety Stock ─────────────────────

export async function updateSafetyStock(variantId: string, safetyStock: number) {
  if (safetyStock < 0) throw new AppError("Safety stock cannot be negative");

  const inv = await prisma.inventoryItem.findUnique({ where: { variantId } });
  if (!inv) throw new NotFoundError("Inventory item");

  return prisma.inventoryItem.update({
    where: { variantId },
    data: { safetyStock },
    include: {
      variant: {
        include: {
          product: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });
}
