import { Prisma, ProductStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors";
import { generateSlug } from "../../lib/slugify";

const productInclude = {
  variants: { include: { inventoryItem: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  categories: { include: { category: true } },
};

// ── Search & Filter ───────────────────────────

export interface ProductFilter {
  categorySlug?: string;
  brand?: string;
  status?: ProductStatus;
  minPrice?: number; // in cents
  maxPrice?: number; // in cents
  search?: string;
  page?: number;
  limit?: number;
}

export async function searchProducts(filters: ProductFilter) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  } else {
    where.status = "ACTIVE"; // default: only active products for public
  }

  if (filters.brand) {
    where.brand = { equals: filters.brand, mode: "insensitive" };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { brand: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.categorySlug) {
    where.categories = {
      some: { category: { slug: filters.categorySlug } },
    };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const priceFilter = {
      ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
      ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
    };
    where.AND = [
      ...(where.AND as Prisma.ProductWhereInput[] || []),
      { OR: [{ priceCents: priceFilter }, { variants: { some: { priceCents: priceFilter } } }] },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── CRUD ──────────────────────────────────────

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  if (!product) throw new NotFoundError("Product");
  return product;
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product) throw new NotFoundError("Product");
  return product;
}

export async function createProduct(data: {
  title: string;
  slug?: string;
  description?: string;
  brand?: string;
  priceCents?: number;
  compareAtPriceCents?: number;
  currency?: string;
  status?: ProductStatus;
}) {
  const slug = data.slug || generateSlug(data.title);

  return prisma.product.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      brand: data.brand,
      priceCents: data.priceCents,
      compareAtPriceCents: data.compareAtPriceCents,
      currency: data.currency || "ILS",
      status: data.status || "DRAFT",
    },
    include: productInclude,
  });
}

export async function updateProduct(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    brand?: string;
    priceCents?: number | null;
    compareAtPriceCents?: number | null;
    currency?: string;
    status?: ProductStatus;
    categoryIds?: string[];
  }
) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Product");

  const { categoryIds, ...fields } = data;
  const updateData: Record<string, any> = { ...fields };
  if (data.title && !data.slug) {
    updateData.slug = generateSlug(data.title);
  }

  // If categoryIds provided, replace all category links
  if (categoryIds !== undefined) {
    updateData.categories = {
      deleteMany: {},
      create: categoryIds.map((categoryId: string) => ({ categoryId })),
    };
  }

  return prisma.product.update({
    where: { id },
    data: updateData,
    include: productInclude,
  });
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Product");

  await prisma.product.delete({ where: { id } });
  return { message: "Product deleted" };
}
