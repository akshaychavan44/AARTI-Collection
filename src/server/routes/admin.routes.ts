import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "../validations/product.validation";
import { createCategorySchema, updateCategorySchema } from "../validations/category.validation";

const router = Router();

// ==========================================
// Mandatory Admin Authorization Middleware
// ==========================================
router.use(requireAuth);
router.use(requireRole("ADMIN"));

// --- 1. Dashboard Metrics ---
router.get("/stats", AdminController.getDashboardStats);

// --- 2. Products Management ---
router.get("/products", AdminController.getProducts);
router.post("/products", validate(createProductSchema, "body"), AdminController.createProduct);
router.get("/products/:id", AdminController.getProductById);
router.put("/products/:id", validate(updateProductSchema, "body"), AdminController.updateProduct);
router.delete("/products/:id", AdminController.deleteProduct);
router.patch("/products/:id/status", AdminController.toggleProductStatus);

// --- 3. Categories Management ---
router.get("/categories", AdminController.getCategories);
router.post("/categories", validate(createCategorySchema, "body"), AdminController.createCategory);
router.put("/categories/:id", validate(updateCategorySchema, "body"), AdminController.updateCategory);
router.delete("/categories/:id", AdminController.deleteCategory);

// --- 4. Orders Management ---
router.get("/orders", AdminController.getOrders);
router.get("/orders/:orderNumber", AdminController.getOrderDetails);
router.patch("/orders/:orderNumber/status", AdminController.updateOrderStatus);

// --- 5. Customers Management ---
router.get("/customers", AdminController.getCustomers);
router.patch("/customers/:id/status", AdminController.toggleCustomerStatus);

// --- 6. Coupons Management ---
router.get("/coupons", AdminController.getCoupons);
router.post("/coupons", AdminController.createCoupon);
router.put("/coupons/:id", AdminController.updateCoupon);
router.delete("/coupons/:id", AdminController.deleteCoupon);

export default router;
