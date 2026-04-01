import { Request, Response, NextFunction } from "express";
import * as inventoryService from "./inventory.service";
import { sendSuccess } from "../../lib/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const result = await inventoryService.listInventory(page, limit);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.getInventory(req.params.variantId);
    sendSuccess(res, item);
  } catch (err) {
    next(err);
  }
}

export async function receive(req: Request, res: Response, next: NextFunction) {
  try {
    const { variantId, quantity, note } = req.body;
    const result = await inventoryService.receiveStock(variantId, quantity, req.user!.userId, note);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function adjust(req: Request, res: Response, next: NextFunction) {
  try {
    const { variantId, quantity, note } = req.body;
    const result = await inventoryService.adjustStock(variantId, quantity, req.user!.userId, note);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function movements(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const result = await inventoryService.getMovements(req.params.variantId, page, limit);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function updateSafetyStock(req: Request, res: Response, next: NextFunction) {
  try {
    const { safetyStock } = req.body;
    const result = await inventoryService.updateSafetyStock(req.params.variantId, safetyStock);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
