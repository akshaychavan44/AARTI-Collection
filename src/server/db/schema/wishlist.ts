import { pgTable, serial, integer, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";

/**
 * Wishlists Table
 * Each authenticated user has a saved wishlist.
 */
export const wishlists = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_wishlists_user").on(table.userId)]
);

/**
 * Wishlist Items Table
 * Products bookmarked by user for later purchase.
 */
export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: serial("id").primaryKey(),
    wishlistId: integer("wishlist_id")
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_wishlist_items_wishlist").on(table.wishlistId),
    uniqueIndex("idx_wishlist_product_unique").on(table.wishlistId, table.productId),
  ]
);

export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;
