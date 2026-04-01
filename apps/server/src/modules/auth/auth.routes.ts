import { Router } from "express";
import * as authController from "./auth.controller";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/password-reset/request", authController.requestPasswordReset);
router.post("/password-reset/confirm", authController.resetPassword);

export default router;
