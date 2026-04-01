import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { auditAction } from "../../middleware/audit";
import * as userController from "./user.controller";

const router = Router();

router.use(authenticate);

// Self-service
router.get("/me", userController.getProfile);
router.patch("/me", userController.updateProfile);

// Admin
router.get("/", authorize("ADMIN"), userController.listUsers);
router.get("/:id", authorize("ADMIN"), userController.getUser);
router.patch("/:id", authorize("ADMIN"), auditAction("User", "UPDATE"), userController.adminUpdateUser);

export default router;
