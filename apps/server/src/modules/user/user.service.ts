import { UserRole } from "@prisma/client";
import prisma from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors";

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// ── Self-service ─────────────────────────────

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });
  if (!user) throw new NotFoundError("User");
  return user;
}

export async function updateProfile(userId: string, data: { fullName?: string; email?: string }) {
  const allowed: Record<string, any> = {};
  if (data.fullName !== undefined) allowed.fullName = data.fullName;
  if (data.email !== undefined) allowed.email = data.email;

  return prisma.user.update({
    where: { id: userId },
    data: allowed,
    select: userSelect,
  });
}

// ── Admin user management ────────────────────

export async function listUsers(page = 1, limit = 20, filters?: { role?: UserRole; isActive?: boolean; search?: string }) {
  const skip = (page - 1) * limit;
  const where: any = {};

  if (filters?.role) where.role = filters.role;
  if (filters?.isActive !== undefined) where.isActive = filters.isActive;
  if (filters?.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: userSelect, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new NotFoundError("User");
  return user;
}

export async function adminUpdateUser(id: string, data: { fullName?: string; email?: string; role?: UserRole; isActive?: boolean }) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("User");

  const allowed: Record<string, any> = {};
  if (data.fullName !== undefined) allowed.fullName = data.fullName;
  if (data.email !== undefined) allowed.email = data.email;
  if (data.role !== undefined) allowed.role = data.role;
  if (data.isActive !== undefined) allowed.isActive = data.isActive;

  return prisma.user.update({ where: { id }, data: allowed, select: userSelect });
}
