import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendSuccess, sendError } from "../../lib/response";
import { chat } from "./chat.service";

// ── Validation Schema ────────────────────────────
const chatSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

// ── Controller ───────────────────────────────────
export const chatController = {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = chatSchema.safeParse(req.body);

      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const { message, history } = parsed.data;

      const response = await chat({ message, history });

      return sendSuccess(res, {
        reply: response.reply,
        toolCalls: response.tools,
        history: response.history,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("[Chat] Error:", error.message);

        if (error.message.includes("API key") || error.message.includes("authentication")) {
          return sendError(res, "Chat service temporarily unavailable", 503);
        }
        if (error.message.includes("rate limit") || error.message.includes("429")) {
          return sendError(res, "Service is busy, please try again in a few seconds", 429);
        }
      }

      next(error);
    }
  },
};
