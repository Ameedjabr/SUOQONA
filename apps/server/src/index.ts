import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

// ── Route imports ────────────────────────────
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import addressRoutes from "./modules/address/address.routes";
import categoryRoutes from "./modules/category/category.routes";
import productRoutes from "./modules/product/product.routes";
import variantRoutes from "./modules/variant/variant.routes";
import imageRoutes from "./modules/image/image.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/order/order.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import auditRoutes from "./modules/audit/audit.routes";
import chatRoutes from "./modules/chat/chat.routes";

const app = express();

// ── Global Middleware ─────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Static file serving (uploads) ─────────────
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// ── Health Check ──────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "souqona-api",
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
});

// ── API Routes ────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/chat", chatRoutes);

// ── Global Error Handler (must be last) ──────
app.use(errorHandler);

// ── Start Server ─────────────────────────────
app.listen(env.PORT, () => {
  console.log(`[Souqona API] Running on port ${env.PORT} (${env.NODE_ENV})`);
});

export default app;
