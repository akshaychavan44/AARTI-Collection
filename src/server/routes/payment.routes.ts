import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { verifyPaymentSchema } from "../validations/order.validation";

const router = Router();

// POST /api/payments/webhook - Public Razorpay webhook endpoint
router.post("/webhook", PaymentController.handleWebhook);

// Protected payment endpoints
router.post("/create-order", requireAuth, PaymentController.createPaymentOrder);
router.post("/verify", requireAuth, validate(verifyPaymentSchema, "body"), PaymentController.verifyPayment);

export default router;
