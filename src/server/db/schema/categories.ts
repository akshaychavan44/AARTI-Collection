import { pgTable, serial, varchar, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

/**
 * PostgreSQL Enum for Gender
 */
export const genderEnum = pgEnum("gender", ["BOYS", "GIRLS"]);

/**
 * Categories Table
 * Stores distinct categories for kids clothing separated by gender (e.g. Boys T-Shirts, Girls Dresses).
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  gender: genderEnum("gender").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
