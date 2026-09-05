import { z } from "zod";

/**
 * Validation schema for validating and applying a promotional coupon
 */
export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, { message: "Coupon code is required" }).max(50),
  subtotal: z.coerce.number().min(0, { message: "Subtotal must be positive" }).optional(),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
