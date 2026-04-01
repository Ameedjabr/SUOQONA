import { Request, Response, NextFunction } from "express";
import * as addressService from "./address.service";
import { sendSuccess } from "../../lib/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const addresses = await addressService.listAddresses(req.user!.userId);
    sendSuccess(res, addresses);
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const address = await addressService.getAddress(req.user!.userId, req.params.id);
    sendSuccess(res, address);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const address = await addressService.createAddress(req.user!.userId, req.body);
    sendSuccess(res, address, 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const address = await addressService.updateAddress(req.user!.userId, req.params.id, req.body);
    sendSuccess(res, address);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await addressService.deleteAddress(req.user!.userId, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
