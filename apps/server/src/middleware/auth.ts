import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../lib/errors";

interface TokenPayload {
  userId: string;
  role: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or invalid token"));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    req.user = { userId: payload.userId, role: payload.role as any };
    next();
  } catch {
    next(new UnauthorizedError("Token expired or invalid"));
  }
}
