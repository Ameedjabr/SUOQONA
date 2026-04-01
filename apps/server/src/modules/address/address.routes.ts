import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as addressController from "./address.controller";

const router = Router();

router.use(authenticate);

router.get("/", addressController.list);
router.get("/:id", addressController.get);
router.post("/", addressController.create);
router.patch("/:id", addressController.update);
router.delete("/:id", addressController.remove);

export default router;
