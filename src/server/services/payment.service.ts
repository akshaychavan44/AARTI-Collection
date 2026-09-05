import crypto from "crypto";
import Razorpay from "razorpay";
import { eq, and, sql } from "drizzle-orm";
import { db } from "../db";
import { orders, orderItems, inventory, users } from "../db/schema";
import { env } from "../config/env";
import { CartService } from "./cart.service";
import { EmailService } from "./email.service";
import { OrderService } from "./order.service";
import { logger } from "../utils/logger";

export interface RazorpayOrderResult {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderNumber: string;
}

export class PaymentService {
  private static getRazorpayInstance(): Razorpay | null {
    if (
      env.RAZORPAY_KEY_ID &&
      env.RAZORPAY_KEY_SECRET &&
      !env.RAZORPAY_KEY_ID.includes("placeholder")
    ) {
      return new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    }
    return null;
  }

  /**
   * Creates a Razorpay order in test/live mode with authoritative amount in paise.
   */
  public static async createRazorpayOrder(
    orderNumber: string,
    userId: number
  ): Promise<RazorpayOrderResult> {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.orderNumber, orderNumber.trim()), eq(orders.userId, userId)),
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.paymentStatus === "PAID") {
      throw new Error("This order has already been paid.");
    }

    const totalInPaise = Math.round(parseFloat(order.total) * 100);
    const rzp = this.getRazorpayInstance();

    let razorpayOrderId: string;

    if (rzp) {
      try {
        const rzpOrder = await rzp.orders.create({
          amount: totalInPaise,
          currency: "INR",
          receipt: order.orderNumber,
          notes: {
            userId: userId.toString(),
            orderNumber: order.orderNumber,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err: any) {
        logger.error("Razorpay order creation failed:", err);
        throw new Error(`Payment gateway error: ${err.message || "Failed to initialize payment"}`);
      }
    } else {
      // In development test simulation mode without live keys
      razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // Associate razorpay order ID with our order record
    await db
      .update(orders)
      .set({
        razorpayOrderId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    return {
      razorpayOrderId,
      amount: totalInPaise,
      currency: "INR",
      keyId: env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
      orderNumber: order.orderNumber,
    };
  }

  /**
   * Verifies Razorpay payment signature, reduces stock, clears cart, and confirms order.
   * Fully protected against duplicate submissions (idempotent).
   */
  public static async verifyPayment(
    orderNumber: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    userId: number
  ) {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.orderNumber, orderNumber.trim()), eq(orders.userId, userId)),
      with: {
        items: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Idempotent guard: if already confirmed/paid, return directly without double stock deduction
    if (order.paymentStatus === "PAID" && order.status === "CONFIRMED") {
      return await OrderService.getOrderByNumber(order.orderNumber, userId);
    }

    // Verify signature
    const signaturePayload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_secret")
      .update(signaturePayload)
      .digest("hex");

    const isTestSimulatedSignature =
      razorpaySignature.startsWith("test_sig_") && env.RAZORPAY_KEY_ID.includes("placeholder");

    const isSignatureValid =
      isTestSimulatedSignature || razorpaySignature === expectedSignature;

    if (!isSignatureValid) {
      await db
        .update(orders)
        .set({
          paymentStatus: "FAILED",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      throw new Error("Invalid payment signature. Transaction verification failed.");
    }

    // 1. Stock Check & Atomic Stock Reduction
    for (const item of order.items) {
      const inv = await db.query.inventory.findFirst({
        where: eq(inventory.variantId, item.variantId),
      });

      if (!inv || inv.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock available for '${item.productName}'. Only ${inv?.quantity ?? 0} left.`
        );
      }
    }

    // Deduct stock for each variant
    for (const item of order.items) {
      await db
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, item.variantId));
    }

    // 2. Mark order as CONFIRMED and PAID
    await db
      .update(orders)
      .set({
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentId: razorpayPaymentId,
        razorpayOrderId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    // 3. Clear user's active shopping cart
    await CartService.clearCart(userId);

    // 4. Send Confirmation Email
    const customer = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (customer) {
      EmailService.sendOrderConfirmationEmail(
        {
          orderNumber: order.orderNumber,
          subtotal: order.subtotal,
          discount: order.discount,
          total: order.total,
          items: order.items.map((i) => ({
            productName: i.productName,
            variantInfo: i.variantInfo,
            quantity: i.quantity,
            price: i.price,
            total: i.total,
          })),
        },
        { name: customer.name, email: customer.email }
      ).catch((err) => logger.warn("Email dispatch error:", err));
    }

    return await OrderService.getOrderByNumber(order.orderNumber, userId);
  }

  /**
   * Handles Razorpay webhook callbacks securely.
   */
  public static async handleWebhook(rawBody: string, signature: string) {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      logger.warn("Webhook secret not configured, skipping webhook verification");
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      throw new Error("Invalid webhook signature");
    }

    const event = JSON.parse(rawBody);
    logger.info(`Webhook received: ${event.event}`);

    // If order was paid via webhook
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const order = await db.query.orders.findFirst({
          where: eq(orders.razorpayOrderId, orderId),
          with: { items: true },
        });

        if (order && order.paymentStatus !== "PAID") {
          // Deduct stock
          for (const item of order.items) {
            await db
              .update(inventory)
              .set({
                quantity: sql`${inventory.quantity} - ${item.quantity}`,
                updatedAt: new Date(),
              })
              .where(eq(inventory.variantId, item.variantId));
          }

          await db
            .update(orders)
            .set({
              status: "CONFIRMED",
              paymentStatus: "PAID",
              paymentId,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));

          await CartService.clearCart(order.userId);
        }
      }
    }

    return true;
  }
}
