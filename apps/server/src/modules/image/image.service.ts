import prisma from "../../lib/prisma";
import { NotFoundError, AppError } from "../../lib/errors";
import { env } from "../../config/env";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.resolve(__dirname, "../../../uploads");

function fileToUrl(filename: string): string {
  const base = env.NODE_ENV === "production"
    ? process.env.APP_URL || `http://localhost:${env.PORT}`
    : `http://localhost:${env.PORT}`;
  return `${base}/uploads/${filename}`;
}

// ── Upload images for a Product ───────────────

export async function uploadProductImages(
  productId: string,
  files: Express.Multer.File[],
  alt?: string
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError("Product");

  if (!files || files.length === 0) throw new AppError("No files uploaded");

  const lastImage = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { sortOrder: "desc" },
  });
  let sortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

  const created = [];
  for (const file of files) {
    const image = await prisma.productImage.create({
      data: {
        productId,
        url: fileToUrl(file.filename),
        alt: alt || product.title,
        sortOrder: sortOrder++,
      },
    });
    created.push(image);
  }

  return created;
}

// ── Upload images for a Variant ───────────────

export async function uploadVariantImages(
  variantId: string,
  files: Express.Multer.File[],
  alt?: string
) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { title: true } } },
  });
  if (!variant) throw new NotFoundError("Variant");

  if (!files || files.length === 0) throw new AppError("No files uploaded");

  const lastImage = await prisma.productImage.findFirst({
    where: { variantId },
    orderBy: { sortOrder: "desc" },
  });
  let sortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

  const created = [];
  for (const file of files) {
    const image = await prisma.productImage.create({
      data: {
        variantId,
        url: fileToUrl(file.filename),
        alt: alt || `${variant.product.title} - ${variant.sku}`,
        sortOrder: sortOrder++,
      },
    });
    created.push(image);
  }

  return created;
}

// ── List images ───────────────────────────────

export async function getProductImages(productId: string) {
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getVariantImages(variantId: string) {
  return prisma.productImage.findMany({
    where: { variantId },
    orderBy: { sortOrder: "asc" },
  });
}

// ── Update image (alt, sortOrder) ─────────────

export async function updateImage(imageId: string, data: { alt?: string; sortOrder?: number }) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new NotFoundError("Image");

  return prisma.productImage.update({
    where: { id: imageId },
    data,
  });
}

// ── Delete image (DB + file) ──────────────────

export async function deleteImage(imageId: string) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new NotFoundError("Image");

  // Delete file from disk
  const filename = image.url.split("/uploads/").pop() || "";
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.productImage.delete({ where: { id: imageId } });
  return { message: "Image deleted" };
}
