import { pgTable, serial, integer, varchar, text, boolean, timestamp, pgEnum, index, numeric } from "drizzle-orm/pg-core";
import { categories, genderEnum } from "./categories";

/**
 * PostgreSQL Enum for Age Groups
 */
export const ageGroupEnum = pgEnum("age_group", [
  "0-2",
  "3-5",
  "6-9",
  "10-13",
  "14-16",
]);

/**
 * Products Table
 * Represents the base clothing item (e.g. "Boys Cotton Printed T-Shirt").
 * Size/color combinations are stored in product_variants.
 */
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 300 }).notNull().unique(),
    description: text("description"),
    gender: genderEnum("gender").notNull(),
    ageGroup: ageGroupEnum("age_group").notNull(),
    brand: varchar("brand", { length: 100 }).default("Kalyan Kids"),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_products_category").on(table.categoryId),
    index("idx_products_gender").on(table.gender),
    index("idx_products_age_group").on(table.ageGroup),
    index("idx_products_is_active").on(table.isActive),
    index("idx_products_is_featured").on(table.isFeatured),
    index("idx_products_name").on(table.name),
  ]
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
