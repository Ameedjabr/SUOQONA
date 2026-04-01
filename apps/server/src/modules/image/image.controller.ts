import { Request, Response, NextFunction } from "express";
import * as imageService from "./image.service";
import { sendSuccess } from "../../lib/response";

// ── Product Images ────────────────────────────

export async function uploadProductImages(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[];
    const images = await imageService.uploadProductImages(
      req.params.productId,
      files,
      req.body.alt
    );
    sendSuccess(res, images, 201);
  } catch (err) {
    next(err);
  }
}

export async function getProductImages(req: Request, res: Response, next: NextFunction) {
  try {
    const images = await imageService.getProductImages(req.params.productId);
    sendSuccess(res, images);
  } catch (err) {
    next(err);
  }
}

// ── Variant Images ────────────────────────────

export async function uploadVariantImages(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[];
    const images = await imageService.uploadVariantImages(
      req.params.variantId,
      files,
      req.body.alt
    );
    sendSuccess(res, images, 201);
  } catch (err) {
    next(err);
  }
}

export async function getVariantImages(req: Request, res: Response, next: NextFunction) {
  try {
    const images = await imageService.getVariantImages(req.params.variantId);
    sendSuccess(res, images);
  } catch (err) {
    next(err);
  }
}

// ── Shared ────────────────────────────────────

export async function updateImage(req: Request, res: Response, next: NextFunction) {
  try {
    const image = await imageService.updateImage(req.params.id, req.body);
    sendSuccess(res, image);
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await imageService.deleteImage(req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
