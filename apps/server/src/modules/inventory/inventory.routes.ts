import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { auditAction } from "../../middleware/audit";
import * as inventoryController from "./inventory.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", inventoryController.list);
router.get("/:variantId", inventoryController.get);
router.post("/receive", auditAction("Inventory", "RECEIVE"), inventoryController.receive);
router.post("/adjust", auditAction("Inventory", "ADJUSTMENT"), inventoryController.adjust);
router.patch("/:variantId/safety-stock", auditAction("Inventory", "UPDATE_SAFETY_STOCK"), inventoryController.updateSafetyStock);
router.get("/:variantId/movements", inventoryController.movements);

export default router;
