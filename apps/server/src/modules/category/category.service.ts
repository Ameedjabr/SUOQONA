import prisma from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors";
import { generateSlug } from "../../lib/slugify";

export async function listCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: {
            include: { children: true }, // 3 levels deep
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { include: { children: true } },
      productLinks: {
        include: {
          product: {
            include: {
              variants: true,
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });
  if (!category) throw new NotFoundError("Category");
  return category;
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  parentId?: string | null;
}) {
  const slug = data.slug || generateSlug(data.name);
  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      parentId: data.parentId || null,
    },
    include: { parent: true, children: true },
  });
}

export async function updateCategory(id: string, data: {
  name?: string;
  slug?: string;
  parentId?: string | null;
}) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Category");

  const updateData: Record<string, any> = { ...data };
  if (data.name && !data.slug) {
    updateData.slug = generateSlug(data.name);
  }

  return prisma.category.update({
    where: { id },
    data: updateData,
    include: { parent: true, children: true },
  });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Category");

  await prisma.category.delete({ where: { id } });
  return { message: "Category deleted" };
}
