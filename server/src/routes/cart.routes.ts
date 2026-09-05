import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addToCartSchema, updateCartItemSchema } from "../validations/cart.validation";

const router = Router();

// All cart operations require authenticated user session
router.use(requireAuth);

// GET /api/cart - Get user's cart
router.get("/", CartController.getCart);

// POST /api/cart/items - Add variant to cart
router.post("/items", validate(addToCartSchema, "body"), CartController.addToCart);

// PUT /api/cart/items/:id - Update item quantity
router.put("/items/:id", validate(updateCartItemSchema, "body"), CartController.updateCartItem);

// DELETE /api/cart/items/:id - Remove item
router.delete("/items/:id", CartController.removeCartItem);

// DELETE /api/cart - Clear cart
router.delete("/", CartController.clearCart);

export default router;
