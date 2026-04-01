import { Request, Response, NextFunction } from "express";
import * as variantService from "./variant.service";
import { sendSuccess } from "../../lib/response";

export async function listByProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const variants = await variantService.listByProduct(req.params.productId);
    sendSuccess(res, variants);
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const variant = await variantService.getVariant(req.params.id);
    sendSuccess(res, variant);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const variant = await variantService.createVariant(req.params.productId, req.body);
    sendSuccess(res, variant, 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const variant = await variantService.updateVariant(req.params.id, req.body);
    sendSuccess(res, variant);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await variantService.deleteVariant(req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
