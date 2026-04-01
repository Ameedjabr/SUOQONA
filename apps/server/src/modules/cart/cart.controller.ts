import { Request, Response, NextFunction } from "express";
import * as cartService from "./cart.service";
import { sendSuccess } from "../../lib/response";

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.getOrCreateCart(req.user!.userId);
    sendSuccess(res, cart);
  } catch (err) {
    next(err);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { variantId, quantity } = req.body;
    const cart = await cartService.addItem(req.user!.userId, variantId, quantity);
    sendSuccess(res, cart);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateItem(req.user!.userId, req.params.itemId, quantity);
    sendSuccess(res, cart);
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.removeItem(req.user!.userId, req.params.itemId);
    sendSuccess(res, cart);
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.clearCart(req.user!.userId);
    sendSuccess(res, cart);
  } catch (err) {
    next(err);
  }
}
