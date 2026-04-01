import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { registerSchema, loginSchema, requestResetSchema, resetPasswordSchema } from "./auth.validation";
import { sendSuccess } from "../../lib/response";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      sendSuccess(res, null);
      return;
    }

    const result = await authService.refreshTokens(token);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("refreshToken");
  sendSuccess(res, { message: "Logged out" });
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = requestResetSchema.parse(req.body);
    const result = await authService.requestPasswordReset(email);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(data.token, data.newPassword);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
