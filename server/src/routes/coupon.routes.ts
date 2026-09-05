import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { validateCouponSchema } from "../validations/coupon.validation";

const router = Router();

// GET /api/coupons - List active public promotions
router.get("/", CouponController.getActiveCoupons);

// POST /api/coupons/validate - Validate coupon code against subtotal (requires auth)
router.post("/validate", requireAuth, validate(validateCouponSchema, "body"), CouponController.validateCoupon);

export default router;
