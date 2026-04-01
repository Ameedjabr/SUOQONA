import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as cartController from "./cart.controller";

const router = Router();

router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.patch("/items/:itemId", cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;
