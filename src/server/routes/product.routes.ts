import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../validations/product.validation";

const router = Router();

// ==========================================
// Public Product Routes
// ==========================================

// GET /api/products - List products with search, filters (gender, category, ageGroup, size, color, price), and pagination
router.get("/", validate(productQuerySchema, "query"), ProductController.getProducts);

// GET /api/products/slug/:slug - Get product by unique SEO slug
router.get("/slug/:slug", ProductController.getProductBySlug);

// GET /api/products/:id - Get product by numeric ID
router.get("/:id", ProductController.getProductById);

// ==========================================
// Dev Admin Product Routes
// ==========================================

// POST /api/products - Create a product with variants, initial stock, and images
router.post("/", validate(createProductSchema, "body"), ProductController.createProduct);

// PUT /api/products/:id - Update product details
router.put("/:id", validate(updateProductSchema, "body"), ProductController.updateProduct);

// DELETE /api/products/:id - Delete product and associated records
router.delete("/:id", ProductController.deleteProduct);

export default router;
