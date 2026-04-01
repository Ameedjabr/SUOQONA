import { Request, Response, NextFunction } from "express";
import { ProductStatus } from "@prisma/client";
import * as productService from "./product.service";
import { sendSuccess } from "../../lib/response";

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: productService.ProductFilter = {
      categorySlug: req.query.category as string,
      brand: req.query.brand as string,
      status: req.query.status as ProductStatus,
      search: req.query.q as string,
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string, 10) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    };
    const result = await productService.searchProducts(filters);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductById(req.params.id);
    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, slug, description, brand, priceCents, compareAtPriceCents, currency, status } = req.body;
    const product = await productService.createProduct({ title, slug, description, brand, priceCents, compareAtPriceCents, currency, status });
    sendSuccess(res, product, 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, slug, description, brand, priceCents, compareAtPriceCents, currency, status, categoryIds } = req.body;
    const product = await productService.updateProduct(req.params.id, { title, slug, description, brand, priceCents, compareAtPriceCents, currency, status, categoryIds });
    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.deleteProduct(req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
