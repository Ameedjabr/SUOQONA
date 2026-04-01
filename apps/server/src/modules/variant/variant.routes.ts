import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { auditAction } from "../../middleware/audit";
import * as variantController from "./variant.controller";

const router = Router();

// Public — list variants for a product
router.get("/product/:productId", variantController.listByProduct);
router.get("/:id", variantController.get);

// Admin only — manage variants
router.post("/product/:productId", authenticate, authorize("ADMIN"), auditAction("Variant", "CREATE"), variantController.create);
router.patch("/:id", authenticate, authorize("ADMIN"), auditAction("Variant", "UPDATE"), variantController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), auditAction("Variant", "DELETE"), variantController.remove);

export default router;
