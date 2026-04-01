import { Request, Response, NextFunction } from "express";
import * as categoryService from "./category.service";
import { sendSuccess } from "../../lib/response";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.listCategories();
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    sendSuccess(res, category);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.createCategory(req.body);
    sendSuccess(res, category, 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    sendSuccess(res, category);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
