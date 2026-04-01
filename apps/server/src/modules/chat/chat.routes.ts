import { Router } from "express";
import { chatController } from "./chat.controller";

const router = Router();

// POST /api/chat - Send a message and get AI response with product search
router.post("/", chatController.sendMessage);

export default router;
