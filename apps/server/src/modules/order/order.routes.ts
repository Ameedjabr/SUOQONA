import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { auditAction } from "../../middleware/audit";
import * as orderController from "./order.controller";

const router = Router();

router.use(authenticate);

// Customer
router.post("/checkout", orderController.checkout);
router.get("/my", orderController.myOrders);
router.get("/my/:id", orderController.myOrder);

// Admin
router.get("/", authorize("ADMIN"), orderController.allOrders);
router.patch("/:id/status", authorize("ADMIN"), auditAction("Order", "UPDATE_STATUS"), orderController.updateStatus);
router.patch("/:id/payment", authorize("ADMIN"), auditAction("Order", "UPDATE_PAYMENT"), orderController.updatePayment);

export default router;
