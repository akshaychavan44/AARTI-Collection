import { z } from "zod";

/**
 * Validation schema for creating a pending order from current user's cart
 */
export const createOrderSchema = z.object({
  couponCode: z.string().trim().max(50).optional(),
});

/**
 * Validation schema for verifying Razorpay payment signature
 */
export const verifyPaymentSchema = z.object({
  orderNumber: z.string().trim().min(1, { message: "orderNumber is required" }),
  razorpayOrderId: z.string().trim().min(1, { message: "razorpayOrderId is required" }),
  razorpayPaymentId: z.string().trim().min(1, { message: "razorpayPaymentId is required" }),
  razorpaySignature: z.string().trim().min(1, { message: "razorpaySignature is required" }),
});

/**
 * Validation schema for order cancellation
 */
export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(255).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
