import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";

export class PaymentController {
  /**
   * POST /api/payments/create-order
   * Initializes Razorpay order for an existing pending order.
   */
  public static async createPaymentOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { orderNumber } = req.body;

      if (!orderNumber || typeof orderNumber !== "string") {
        res.status(400).json({ success: false, message: "orderNumber is required" });
        return;
      }

      const paymentOrder = await PaymentService.createRazorpayOrder(orderNumber, userId);

      res.status(200).json({
        success: true,
        message: "Payment order initialized",
        data: paymentOrder,
      });
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message?.includes("already")) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/payments/verify
   * Verifies Razorpay payment signature, decrements stock, clears cart, and confirms order.
   */
  public static async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const confirmedOrder = await PaymentService.verifyPayment(
        orderNumber,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Payment successfully verified! Your order has been confirmed.",
        data: confirmedOrder,
      });
    } catch (error: any) {
      if (error.message?.includes("signature") || error.message?.includes("stock")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/payments/webhook
   * Handles incoming Razorpay webhook events.
   */
  public static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      await PaymentService.handleWebhook(rawBody, signature);

      res.status(200).json({ status: "ok" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
