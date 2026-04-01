import prisma from "../../lib/prisma";
import { NotFoundError, AppError } from "../../lib/errors";

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: { select: { id: true, title: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
          inventoryItem: true,
        },
      },
    },
  },
};

export async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  return cart;
}

export async function addItem(userId: string, variantId: string, quantity: number) {
  if (quantity < 1) throw new AppError("Quantity must be at least 1");

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { inventoryItem: true },
  });
  if (!variant || !variant.isActive) throw new NotFoundError("Product variant");

  const cart = await getOrCreateCart(userId);

  // Check if item already exists in cart
  const existingItem = cart.items.find((item) => item.variantId === variantId);

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    // Check stock
    if (variant.inventoryItem && newQty > variant.inventoryItem.onHand - variant.inventoryItem.reserved) {
      throw new AppError("Insufficient stock");
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  } else {
    // Check stock
    if (variant.inventoryItem && quantity > variant.inventoryItem.onHand - variant.inventoryItem.reserved) {
      throw new AppError("Insufficient stock");
    }

    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId, quantity },
    });
  }

  return getOrCreateCart(userId);
}

export async function updateItem(userId: string, itemId: string, quantity: number) {
  if (quantity < 1) throw new AppError("Quantity must be at least 1");

  const cart = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (!cart) throw new NotFoundError("Cart");

  // Look up by CartItem id OR by variantId
  const item = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      OR: [{ id: itemId }, { variantId: itemId }],
    },
    include: { variant: { include: { inventoryItem: true } } },
  });
  if (!item) throw new NotFoundError("Cart item");

  // Check stock
  if (item.variant.inventoryItem && quantity > item.variant.inventoryItem.onHand - item.variant.inventoryItem.reserved) {
    throw new AppError("Insufficient stock");
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  return getOrCreateCart(userId);
}

export async function removeItem(userId: string, itemId: string) {
  const cart = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (!cart) throw new NotFoundError("Cart");

  // Look up by CartItem id OR by variantId
  const item = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      OR: [{ id: itemId }, { variantId: itemId }],
    },
  });
  if (!item) throw new NotFoundError("Cart item");

  await prisma.cartItem.delete({ where: { id: item.id } });

  return getOrCreateCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (!cart) throw new NotFoundError("Cart");

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return getOrCreateCart(userId);
}
