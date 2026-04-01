import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { upload } from "../../middleware/upload";
import * as imageController from "./image.controller";

const router = Router();

// ── Product Images ────────────────────────────
// Public: list
router.get("/product/:productId", imageController.getProductImages);
// Admin: upload (up to 10 files)
router.post(
  "/product/:productId",
  authenticate,
  authorize("ADMIN"),
  upload.array("images", 10),
  imageController.uploadProductImages
);
// Admin: update / delete a product image
router.patch("/product/:productId/:id", authenticate, authorize("ADMIN"), imageController.updateImage);
router.delete("/product/:productId/:id", authenticate, authorize("ADMIN"), imageController.deleteImage);

// ── Variant Images ────────────────────────────
// Public: list
router.get("/variant/:variantId", imageController.getVariantImages);
// Admin: upload (up to 10 files)
router.post(
  "/variant/:variantId",
  authenticate,
  authorize("ADMIN"),
  upload.array("images", 10),
  imageController.uploadVariantImages
);
// Admin: update / delete a variant image
router.patch("/variant/:variantId/:id", authenticate, authorize("ADMIN"), imageController.updateImage);
router.delete("/variant/:variantId/:id", authenticate, authorize("ADMIN"), imageController.deleteImage);

// ── Generic (update/delete by image ID only) ──
router.patch("/:id", authenticate, authorize("ADMIN"), imageController.updateImage);
router.delete("/:id", authenticate, authorize("ADMIN"), imageController.deleteImage);

export default router;
