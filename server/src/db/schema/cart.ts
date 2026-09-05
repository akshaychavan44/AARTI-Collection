import { pgTable, serial, integer, numeric, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";
import { productVariants } from "./variants";

/**
 * Carts Table
 * Each authenticated user has exactly one active persistent cart.
 */
export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_carts_user").on(table.userId)]
);

/**
 * Cart Items Table
 * Represents an individual product variant added to a user's cart.
 * Price is saved authoritatively from product_variants.price at insertion.
 */
export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").default(1).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cart_items_cart").on(table.cartId),
    index("idx_cart_items_variant").on(table.variantId),
    uniqueIndex("idx_cart_variant_unique").on(table.cartId, table.variantId),
  ]
);

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
