import { pgTable, serial, integer, text, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { products } from "./products";

/**
 * Product Images Table
 * Stores image gallery URLs and order for each product.
 */
export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_product_images_product").on(table.productId),
  ]
);

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
