import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { AppError, NotFoundError } from "../../lib/errors";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SQ-${timestamp}-${random}`;
}

const orderInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  },
  user: { select: { id: true, email: true, fullName: true } },
};

// ── Valid status transitions ─────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

// ── Atomic Checkout ───────────────────────────

export interface CheckoutData {
  customerName: string;
  customerEmail?: string;
  phonePrimary: string;
  phoneSecondary?: string;
  country: string;
  city: string;
  area: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  deliveryNotes?: string;
  currency?: string;
  shippingCents?: number;
  discountCents?: number;
  taxCents?: number;
}

export async function checkout(userId: string, data: CheckoutData) {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch the active cart with items
    const cart = await tx.cart.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                inventoryItem: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty");
    }

    // 2. Verify stock for every item
    for (const item of cart.items) {
      const inv = item.variant.inventoryItem;
      if (!inv) {
        throw new AppError(`No inventory record for variant ${item.variant.sku}`);
      }
      const available = inv.onHand - inv.reserved;
      if (item.quantity > available) {
        throw new AppError(
          `Insufficient stock for "${item.variant.product.title}" (SKU: ${item.variant.sku}). Available: ${available}, Requested: ${item.quantity}`
        );
      }
    }

    // 3. Calculate totals (all in cents)
    let subtotalCents = 0;
    const orderItems: {
      variantId: string;
      productTitle: string;
      variantSku: string;
      unitPriceCents: number;
      quantity: number;
      lineTotalCents: number;
    }[] = [];

    for (const item of cart.items) {
      const lineTotal = item.variant.priceCents * item.quantity;
      subtotalCents += lineTotal;

      orderItems.push({
        variantId: item.variantId,
        productTitle: item.variant.product.title,
        variantSku: item.variant.sku,
        unitPriceCents: item.variant.priceCents,
        quantity: item.quantity,
        lineTotalCents: lineTotal,
      });
    }

    const shippingCents = data.shippingCents || 0;
    const discountCents = data.discountCents || 0;
    const taxCents = data.taxCents || 0;
    const totalCents = subtotalCents - discountCents + shippingCents + taxCents;

    // 4. Create the Order + OrderItems
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        phonePrimary: data.phonePrimary,
        phoneSecondary: data.phoneSecondary,
        country: data.country,
        city: data.city,
        area: data.area,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        postalCode: data.postalCode,
        deliveryNotes: data.deliveryNotes,
        currency: data.currency || "ILS",
        subtotalCents,
        discountCents,
        shippingCents,
        taxCents,
        totalCents,
        items: { create: orderItems },
      },
      include: orderInclude,
    });

    // 5. Create InventoryMovement (RESERVE) + Update InventoryItem for each item
    for (const item of cart.items) {
      await tx.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          type: "RESERVE",
          quantity: item.quantity,
          referenceType: "Order",
          referenceId: order.id,
          note: `Reserved for order ${order.orderNumber}`,
          createdBy: userId,
        },
      });

      await tx.inventoryItem.update({
        where: { variantId: item.variantId },
        data: { reserved: { increment: item.quantity } },
      });
    }

    // 6. Convert the cart
    await tx.cart.update({
      where: { id: cart.id },
      data: { status: "CONVERTED" },
    });

    return order;
  });
}

// ── Order Queries ─────────────────────────────

export async function getOrdersByUser(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getOrderById(orderId: string, userId?: string) {
  const where: any = { id: orderId };
  if (userId) where.userId = userId;

  const order = await prisma.order.findFirst({
    where,
    include: orderInclude,
  });
  if (!order) throw new NotFoundError("Order");
  return order;
}

export async function getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
  const skip = (page - 1) * limit;
  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── Order Status Updates (Admin) ──────────────

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new NotFoundError("Order");

  // Validate transition
  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition: ${order.status} → ${newStatus}. Allowed: ${allowed.join(", ") || "none"}`
    );
  }

  // When shipping: deduct reserved, decrease onHand
  if (newStatus === "SHIPPED") {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.variantId) continue;

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: "SHIP",
            quantity: item.quantity,
            referenceType: "Order",
            referenceId: orderId,
            note: `Shipped for order ${order.orderNumber}`,
          },
        });

        await tx.inventoryItem.update({
          where: { variantId: item.variantId },
          data: {
            onHand: { decrement: item.quantity },
            reserved: { decrement: item.quantity },
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    });
  } else if (newStatus === "CANCELLED") {
    // Release reserved stock
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.variantId) continue;

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: "RELEASE",
            quantity: item.quantity,
            referenceType: "Order",
            referenceId: orderId,
            note: `Released (cancelled) order ${order.orderNumber}`,
          },
        });

        await tx.inventoryItem.update({
          where: { variantId: item.variantId },
          data: { reserved: { decrement: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    });
  } else {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }

  return getOrderById(orderId);
}

// ── Order Payment Update (Admin) ──────────────

export async function updateOrderPayment(
  orderId: string,
  data: {
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
  }
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError("Order");

  const updateData: Record<string, any> = {};
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
  if (data.paymentStatus !== undefined) {
    updateData.paymentStatus = data.paymentStatus;
    // Auto-set paidAt when marking as COLLECTED
    if (data.paymentStatus === "COLLECTED" && !order.paidAt) {
      updateData.paidAt = new Date();
    }
  }

  return prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: orderInclude,
  });
}
