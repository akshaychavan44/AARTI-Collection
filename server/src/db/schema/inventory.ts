import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { productVariants } from "./variants";

/**
 * Inventory Table
 * Manages physical stock levels for each specific product variant.
 */
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .unique()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

/**
 * Calculates stock status based on current quantity and low stock threshold.
 */
export const calculateStockStatus = (
  quantity: number,
  threshold: number = 5
): StockStatus => {
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (quantity <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
};
