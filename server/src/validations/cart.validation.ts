import { z } from "zod";

/**
 * Validation schema for adding an item to the cart
 */
export const addToCartSchema = z.object({
  productId: z.coerce.number().int().positive({ message: "Valid productId is required" }),
  variantId: z.coerce.number().int().positive({ message: "Valid variantId is required" }),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }).default(1),
});

/**
 * Validation schema for updating item quantity in cart
 */
export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, { message: "Quantity must be 0 or greater" }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
