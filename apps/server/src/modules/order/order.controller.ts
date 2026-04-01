import { Request, Response, NextFunction } from "express";
import { OrderStatus } from "@prisma/client";
import * as orderService from "./order.service";
import { sendSuccess } from "../../lib/response";

export async function checkout(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.checkout(req.user!.userId, req.body);
    sendSuccess(res, order, 201);
  } catch (err) {
    next(err);
  }
}

export async function myOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const result = await orderService.getOrdersByUser(req.user!.userId, page, limit);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function myOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.userId);
    sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
}

export async function allOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const status = req.query.status as OrderStatus | undefined;
    const result = await orderService.getAllOrders(page, limit, status);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
}

export async function updatePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { paymentMethod, paymentStatus } = req.body;
    const order = await orderService.updateOrderPayment(req.params.id, { paymentMethod, paymentStatus });
    sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
}
