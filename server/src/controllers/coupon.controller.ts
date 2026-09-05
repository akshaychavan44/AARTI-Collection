import { Request, Response, NextFunction } from "express";
import { CouponService } from "../services/coupon.service";

export class CouponController {
  /**
   * POST /api/coupons/validate
   * Validates coupon code against order subtotal.
   */
  public static async validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, subtotal } = req.body;

      const result = await CouponService.validateCoupon(code, subtotal || 0);

      if (!result.valid) {
        res.status(400).json({
          success: false,
          message: result.message,
          data: result,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/coupons
   * Lists available active coupons.
   */
  public static async getActiveCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await CouponService.getActiveCoupons();
      res.status(200).json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      next(error);
    }
  }
}
