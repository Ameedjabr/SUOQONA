import prisma from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors";

export async function listAddresses(userId: string) {
  return prisma.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAddress(userId: string, addressId: string) {
  const address = await prisma.userAddress.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new NotFoundError("Address");
  return address;
}

export async function createAddress(userId: string, data: {
  label?: string;
  fullName: string;
  phonePrimary: string;
  phoneSecondary?: string;
  country: string;
  city: string;
  area: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  isDefault?: boolean;
}) {
  // If setting as default, unset all others first
  if (data.isDefault) {
    await prisma.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.userAddress.create({
    data: { ...data, userId },
  });
}

export async function updateAddress(userId: string, addressId: string, data: Record<string, any>) {
  // Verify ownership
  const existing = await prisma.userAddress.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) throw new NotFoundError("Address");

  // Allowlist fields to prevent userId injection
  const allowed: Record<string, any> = {};
  const ALLOWED_FIELDS = [
    "label", "fullName", "phonePrimary", "phoneSecondary",
    "country", "city", "area", "addressLine1", "addressLine2",
    "postalCode", "isDefault",
  ];
  for (const key of ALLOWED_FIELDS) {
    if (data[key] !== undefined) allowed[key] = data[key];
  }

  if (allowed.isDefault) {
    await prisma.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.userAddress.update({
    where: { id: addressId },
    data: allowed,
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const existing = await prisma.userAddress.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) throw new NotFoundError("Address");

  await prisma.userAddress.delete({ where: { id: addressId } });
  return { message: "Address deleted" };
}
