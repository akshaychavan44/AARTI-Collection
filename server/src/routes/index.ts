import { Router } from "express";
import healthRoutes from "./health.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import authRoutes from "./auth.routes";
import cartRoutes from "./cart.routes";
import wishlistRoutes from "./wishlist.routes";
import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import couponRoutes from "./coupon.routes";
import adminRoutes from "./admin.routes";

const router = Router();

// Health Check route (/api/health)
router.use("/", healthRoutes);

// Authentication & Profile routes (/api/auth)
router.use("/auth", authRoutes);

// Category routes (/api/categories)
router.use("/categories", categoryRoutes);

// Product routes (/api/products)
router.use("/products", productRoutes);

// Shopping Cart routes (/api/cart)
router.use("/cart", cartRoutes);

// Wishlist routes (/api/wishlist)
router.use("/wishlist", wishlistRoutes);

// Order routes (/api/orders)
router.use("/orders", orderRoutes);

// Payment routes (/api/payments)
router.use("/payments", paymentRoutes);

// Promotional Coupon routes (/api/coupons)
router.use("/coupons", couponRoutes);

// Admin Management Console routes (/api/admin)
router.use("/admin", adminRoutes);

export default router;
