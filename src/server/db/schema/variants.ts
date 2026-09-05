import { pgTable, serial, integer, varchar, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { products } from "./products";

/**
 * Product Variants Table
 * Represents specific size and color combinations for each product (e.g., 6-7Y / Blue).
 * Each variant has a distinct price and unique SKU.
 */
export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: varchar("size", { length: 50 }).notNull(),
    color: varchar("color", { length: 50 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_product_variants_product").on(table.productId),
    index("idx_product_variants_size").on(table.size),
    index("idx_product_variants_color").on(table.color),
    index("idx_product_variants_price").on(table.price),
  ]
);

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
