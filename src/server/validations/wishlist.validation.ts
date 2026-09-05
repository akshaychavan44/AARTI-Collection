import { z } from "zod";

/**
 * Validation schema for adding a product to wishlist
 */
export const addToWishlistSchema = z.object({
  productId: z.coerce.number().int().positive({ message: "Valid productId is required" }),
});

export const moveToCartSchema = z.object({
  variantId: z.coerce.number().int().positive().optional(),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type MoveToCartInput = z.infer<typeof moveToCartSchema>;
