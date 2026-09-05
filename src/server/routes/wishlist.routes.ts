import { Router } from "express";
import { WishlistController } from "../controllers/wishlist.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addToWishlistSchema, moveToCartSchema } from "../validations/wishlist.validation";

const router = Router();

// All wishlist operations require authenticated user session
router.use(requireAuth);

// GET /api/wishlist - Get user's saved wishlist
router.get("/", WishlistController.getWishlist);

// POST /api/wishlist - Add product to wishlist
router.post("/", validate(addToWishlistSchema, "body"), WishlistController.addToWishlist);

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete("/:productId", WishlistController.removeFromWishlist);

// POST /api/wishlist/:productId/move-to-cart - Move product to cart
router.post("/:productId/move-to-cart", validate(moveToCartSchema, "body"), WishlistController.moveToCart);

export default router;
