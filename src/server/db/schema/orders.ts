import { pgTable, serial, integer, varchar, text, numeric, timestamp, index, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";
import { productVariants } from "./variants";

/**
 * Order Status Enum
 * PENDING: Created upon checkout initiation
 * CONFIRMED: Payment verified, stock reduced, ready for store pickup
 * CANCELLED: Order cancelled by customer or admin, stock restored
 */
export const orderStatusEnum = pgEnum("order_status", ["PENDING", "CONFIRMED", "CANCELLED"]);

/**
 * Payment Status Enum
 * PENDING: Awaiting payment verification
 * PAID: Razorpay payment signature successfully verified
 * FAILED: Payment attempt failed
 * REFUNDED: Refund processed
 */
export const paymentStatusEnum = pgEnum("payment_status", ["PENDING", "PAID", "FAILED", "REFUNDED"]);

/**
 * Orders Table
 * Stores customer order records with authoritative pricing and Razorpay references.
 */
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").default("PENDING").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").default("PENDING").notNull(),
    paymentId: varchar("payment_id", { length: 100 }),
    razorpayOrderId: varchar("razorpay_order_id", { length: 100 }),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    couponCode: varchar("coupon_code", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_orders_user").on(table.userId),
    index("idx_orders_order_number").on(table.orderNumber),
    index("idx_orders_status").on(table.status),
  ]
);

/**
 * Order Items Table
 * Historical snapshot of purchased product variants and prices at the exact time of order.
 */
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id),
    productName: varchar("product_name", { length: 255 }).notNull(),
    variantInfo: varchar("variant_info", { length: 100 }).notNull(),
    productImage: text("product_image"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_order_items_order").on(table.orderId),
    index("idx_order_items_variant").on(table.variantId),
  ]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
