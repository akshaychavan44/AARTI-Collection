import { pgTable, serial, varchar, numeric, boolean, timestamp, index, pgEnum } from "drizzle-orm/pg-core";

/**
 * Coupon Discount Type Enum
 * PERCENTAGE: e.g. 10% discount off subtotal
 * FIXED: e.g. ₹100 flat discount off subtotal
 */
export const discountTypeEnum = pgEnum("discount_type", ["PERCENTAGE", "FIXED"]);

/**
 * Coupons Table
 * Stores promotional coupon codes with optional minimum order amounts and expiry dates.
 */
export const coupons = pgTable(
  "coupons",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_coupons_code").on(table.code),
  ]
);

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
