import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { ForbiddenError } from "../lib/errors";

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }
    next();
  };
}
