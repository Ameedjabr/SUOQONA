import prisma from "../../lib/prisma";
import { NotFoundError, AppError } from "../../lib/errors";

const variantInclude = {
  product: { select: { id: true, title: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  inventoryItem: true,
};

export async function listByProduct(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError("Product");

  return prisma.productVariant.findMany({
    where: { productId },
    include: variantInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function getVariant(variantId: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: variantInclude,
  });
  if (!variant) throw new NotFoundError("Variant");
  return variant;
}

export async function createVariant(productId: string, data: {
  sku: string;
  barcode?: string;
  priceCents: number;
  compareAtPriceCents?: number;
  currency?: string;
  optionValues?: Record<string, string>;
  isActive?: boolean;
  initialStock?: number;
}) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError("Product");

  if (data.priceCents < 0) throw new AppError("Price must be a positive integer (cents)");

  return prisma.productVariant.create({
    data: {
      productId,
      sku: data.sku,
      barcode: data.barcode,
      priceCents: data.priceCents,
      compareAtPriceCents: data.compareAtPriceCents,
      currency: data.currency || "ILS",
      optionValues: data.optionValues || {},
      isActive: data.isActive ?? true,
      inventoryItem: {
        create: {
          onHand: data.initialStock || 0,
          reserved: 0,
          safetyStock: 0,
        },
      },
    },
    include: variantInclude,
  });
}

export async function updateVariant(variantId: string, data: {
  sku?: string;
  barcode?: string;
  priceCents?: number;
  compareAtPriceCents?: number | null;
  currency?: string;
  optionValues?: Record<string, string>;
  isActive?: boolean;
}) {
  const existing = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!existing) throw new NotFoundError("Variant");

  if (data.priceCents !== undefined && data.priceCents < 0) {
    throw new AppError("Price must be a positive integer (cents)");
  }

  return prisma.productVariant.update({
    where: { id: variantId },
    data,
    include: variantInclude,
  });
}

export async function deleteVariant(variantId: string) {
  const existing = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!existing) throw new NotFoundError("Variant");

  await prisma.productVariant.delete({ where: { id: variantId } });
  return { message: "Variant deleted" };
}
