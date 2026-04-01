import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { auditAction } from "../../middleware/audit";
import * as productController from "./product.controller";

const router = Router();

// Public
router.get("/", productController.search);
router.get("/slug/:slug", productController.getBySlug);
router.get("/:id", productController.getById);

// Admin only
router.post("/", authenticate, authorize("ADMIN"), auditAction("Product", "CREATE"), productController.create);
router.patch("/:id", authenticate, authorize("ADMIN"), auditAction("Product", "UPDATE"), productController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), auditAction("Product", "DELETE"), productController.remove);

export default router;
