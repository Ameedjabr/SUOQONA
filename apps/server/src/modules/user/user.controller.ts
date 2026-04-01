import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import * as userService from "./user.service";
import { sendSuccess } from "../../lib/response";

// ── Self-service ─────────────────────────────

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullName, email } = req.body;
    const user = await userService.updateProfile(req.user!.userId, { fullName, email });
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

// ── Admin ────────────────────────────────────

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const role = req.query.role as UserRole | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
    const search = req.query.q as string | undefined;
    const result = await userService.listUsers(page, limit, { role, isActive, search });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullName, email, role, isActive } = req.body;
    const user = await userService.adminUpdateUser(req.params.id, { fullName, email, role, isActive });
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
