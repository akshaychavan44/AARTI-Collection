import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db";
import {
  orders,
  orderItems,
  inventory,
  productVariants,
  Order,
  OrderItem,
} from "../db/schema";
import { CartService } from "./cart.service";
import { CouponService } from "./coupon.service";

export interface FormattedOrderItem {
  id: number;
  productId: number;
  variantId: number;
  productName: string;
  variantInfo: string;
  productImage: string | null;
  price: number;
  quantity: number;
  total: number;
}

export interface FormattedOrder {
  id: number;
  orderNumber: string;
  userId: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentId: string | null;
  razorpayOrderId: string | null;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: FormattedOrderItem[];
}

export class OrderService {
  /**
   * Generates a human-friendly unique order number.
   * Format: ORD-YYYYMMDD-XXXX (e.g. ORD-20260905-F4D2)
   */
  public static generateOrderNumber(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${yyyy}${mm}${dd}-${randomHex}`;
  }

  /**
   * Creates a PENDING order authoritatively from the user's current persistent cart.
   * Verifies live stock and calculates subtotal & discounts on the server.
   */
  public static async createOrderFromCart(
    userId: number,
    couponCode?: string
  ): Promise<FormattedOrder> {
    const cart = await CartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new Error("Your shopping cart is empty. Please add items before checkout.");
    }

    if (cart.hasOutOfStockItems) {
      throw new Error("Some items in your cart are currently out of stock. Please adjust your cart.");
    }

    const subtotal = cart.subtotal;
    let discount = 0;
    let total = subtotal;
    let appliedCoupon: string | null = null;

    if (couponCode && couponCode.trim()) {
      const couponResult = await CouponService.validateCoupon(couponCode, subtotal);
      if (!couponResult.valid) {
        throw new Error(couponResult.message || "Invalid coupon code");
      }
      discount = couponResult.discountAmount;
      total = couponResult.finalTotal;
      appliedCoupon = couponResult.code;
    }

    const orderNumber = this.generateOrderNumber();

    // 1. Insert order record
    const [createdOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: subtotal.toString(),
        discount: discount.toString(),
        total: total.toString(),
        couponCode: appliedCoupon,
      })
      .returning();

    // 2. Insert order items snapshot (historical preserve)
    const itemsToInsert = cart.items.map((item) => ({
      orderId: createdOrder.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product.name,
      variantInfo: `Size: ${item.variant.size} | Color: ${item.variant.color}`,
      productImage: item.product.image,
      price: item.unitPrice.toString(),
      quantity: item.quantity,
      total: item.totalPrice.toString(),
    }));

    await db.insert(orderItems).values(itemsToInsert);

    return await this.getOrderById(createdOrder.id, userId);
  }

  /**
   * Retrieves order by numeric ID with user ownership check.
   */
  public static async getOrderById(orderId: number, userId: number, isAdmin: boolean = false): Promise<FormattedOrder> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
      },
    });

    if (!order || (!isAdmin && order.userId !== userId)) {
      throw new Error("Order not found");
    }

    return this.formatOrder(order);
  }

  /**
   * Retrieves order by string orderNumber with user ownership check.
   */
  public static async getOrderByNumber(
    orderNumber: string,
    userId: number,
    isAdmin: boolean = false
  ): Promise<FormattedOrder> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber.trim()),
      with: {
        items: true,
      },
    });

    if (!order || (!isAdmin && order.userId !== userId)) {
      throw new Error("Order not found");
    }

    return this.formatOrder(order);
  }

  /**
   * Retrieves all orders belonging to the user.
   */
  public static async getUserOrders(userId: number): Promise<FormattedOrder[]> {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        items: true,
      },
      orderBy: [desc(orders.createdAt)],
    });

    return userOrders.map((o) => this.formatOrder(o));
  }

  /**
   * Cancels order and restores variant inventory if order was confirmed/paid.
   */
  public static async cancelOrder(
    orderNumber: string,
    userId: number,
    isAdmin: boolean = false
  ): Promise<FormattedOrder> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber.trim()),
      with: {
        items: true,
      },
    });

    if (!order || (!isAdmin && order.userId !== userId)) {
      throw new Error("Order not found");
    }

    if (order.status === "CANCELLED") {
      throw new Error("This order has already been cancelled.");
    }

    // If order was CONFIRMED and inventory was reduced, restore stock
    if (order.status === "CONFIRMED") {
      for (const item of order.items) {
        await db
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(inventory.variantId, item.variantId));
      }
    }

    await db
      .update(orders)
      .set({
        status: "CANCELLED",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    return await this.getOrderByNumber(orderNumber, userId, isAdmin);
  }

  /**
   * Formats raw relational order into consistent API structure.
   */
  private static formatOrder(order: any): FormattedOrder {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      razorpayOrderId: order.razorpayOrderId,
      subtotal: parseFloat(order.subtotal),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      couponCode: order.couponCode,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: (order.items || []).map((i: any) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantInfo: i.variantInfo,
        productImage: i.productImage,
        price: parseFloat(i.price),
        quantity: i.quantity,
        total: parseFloat(i.total),
      })),
    };
  }
}
