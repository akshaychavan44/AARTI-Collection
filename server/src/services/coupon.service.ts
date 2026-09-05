import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { coupons, Coupon } from "../db/schema";

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  code: string;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  discountAmount: number;
  finalTotal: number;
}

export class CouponService {
  /**
   * Validates a promotional coupon code against an order subtotal.
   * Calculates discount on server (never trusting frontend calculations).
   */
  public static async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<CouponValidationResult> {
    const cleanCode = code.trim().toUpperCase();

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, cleanCode))
      .limit(1);

    if (!coupon) {
      return {
        valid: false,
        message: `Coupon code '${cleanCode}' does not exist`,
        code: cleanCode,
        discountAmount: 0,
        finalTotal: subtotal,
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        message: `Coupon '${cleanCode}' is no longer active`,
        code: cleanCode,
        discountAmount: 0,
        finalTotal: subtotal,
      };
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return {
        valid: false,
        message: `Coupon '${cleanCode}' has expired`,
        code: cleanCode,
        discountAmount: 0,
        finalTotal: subtotal,
      };
    }

    const minAmount = parseFloat(coupon.minOrderAmount);
    if (subtotal < minAmount) {
      return {
        valid: false,
        message: `Coupon '${cleanCode}' requires a minimum order of ₹${minAmount}`,
        code: cleanCode,
        discountAmount: 0,
        finalTotal: subtotal,
      };
    }

    const value = parseFloat(coupon.discountValue);
    let discountAmount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Number(((subtotal * value) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(value, subtotal);
    }

    const finalTotal = Number(Math.max(0, subtotal - discountAmount).toFixed(2));

    return {
      valid: true,
      message: `Coupon '${cleanCode}' applied successfully!`,
      code: cleanCode,
      discountType: coupon.discountType,
      discountValue: value,
      discountAmount,
      finalTotal,
    };
  }

  /**
   * Retrieves active promotional coupons for store display.
   */
  public static async getActiveCoupons(): Promise<Coupon[]> {
    return await db
      .select()
      .from(coupons)
      .where(eq(coupons.isActive, true));
  }
}
