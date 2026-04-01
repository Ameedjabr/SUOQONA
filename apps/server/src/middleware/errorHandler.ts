import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { sendError } from "../lib/response";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
    sendError(res, messages.join(", "), 422);
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma known errors
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;
    if (prismaErr.code === "P2002") {
      const fields = prismaErr.meta?.target?.join(", ") || "field";
      sendError(res, `Duplicate value for: ${fields}`, 409);
      return;
    }
    if (prismaErr.code === "P2025") {
      sendError(res, "Record not found", 404);
      return;
    }
  }

  // Unexpected errors
  console.error("[ERROR]", err);
  sendError(res, "Internal server error", 500);
};
