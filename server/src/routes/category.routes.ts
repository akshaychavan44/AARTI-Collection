import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { validate } from "../middleware/validate";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from "../validations/category.validation";

const router = Router();

// ==========================================
// Public Category Routes
// ==========================================

// GET /api/categories - List all categories with optional gender/active filtering
router.get("/", validate(categoryQuerySchema, "query"), CategoryController.getCategories);

// GET /api/categories/:id - Get single category by ID
router.get("/:id", CategoryController.getCategoryById);

// ==========================================
// Dev Admin Category Routes
// ==========================================

// POST /api/categories - Create a new category
router.post("/", validate(createCategorySchema, "body"), CategoryController.createCategory);

// PUT /api/categories/:id - Update an existing category
router.put("/:id", validate(updateCategorySchema, "body"), CategoryController.updateCategory);

// DELETE /api/categories/:id - Remove a category
router.delete("/:id", CategoryController.deleteCategory);

export default router;
