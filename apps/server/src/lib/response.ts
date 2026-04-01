import { Response } from "express";

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  const body: ApiResponse<T> = { success: true, data, error: null };
  return res.status(status).json(body);
}

export function sendError(res: Response, error: string, status = 400) {
  const body: ApiResponse = { success: false, data: null, error };
  return res.status(status).json(body);
}
