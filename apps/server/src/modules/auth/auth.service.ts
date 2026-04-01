import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRole } from "@prisma/client";
import prisma from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from "../../lib/errors";

function signAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
}

function signRefreshToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export async function register(data: {
  email: string;
  password: string;
  fullName: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError("Email already registered");

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
    },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  return { user, accessToken, refreshToken };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new UnauthorizedError("Invalid credentials");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError("Invalid credentials");

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
      userId: string;
      role: UserRole;
    };

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) throw new UnauthorizedError("User not found or inactive");

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);

    return { accessToken, refreshToken };
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether user exists
    return { message: "If an account exists, a reset link has been sent" };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  // In production: send email with token
  // For now, return it in dev mode
  return {
    message: "If an account exists, a reset link has been sent",
    ...(env.NODE_ENV === "development" && { token }),
  };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) throw new NotFoundError("Reset token");
  if (resetToken.usedAt) throw new AppError("Token already used");
  if (resetToken.expiresAt < new Date()) throw new AppError("Token expired");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { message: "Password reset successfully" };
}
