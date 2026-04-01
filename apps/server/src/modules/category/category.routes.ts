import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { auditAction } from "../../middleware/audit";
import * as categoryController from "./category.controller";

const router = Router();

// Public
router.get("/", categoryController.list);
router.get("/:slug", categoryController.getBySlug);

// Admin only
router.post("/", authenticate, authorize("ADMIN"), auditAction("Category", "CREATE"), categoryController.create);
router.patch("/:id", authenticate, authorize("ADMIN"), auditAction("Category", "UPDATE"), categoryController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), auditAction("Category", "DELETE"), categoryController.remove);

export default router;
