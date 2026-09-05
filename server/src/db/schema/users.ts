import { pgTable, serial, varchar, boolean, timestamp, pgEnum, index } from "drizzle-orm/pg-core";

/**
 * PostgreSQL Enum for User Roles
 */
export const roleEnum = pgEnum("role", ["CUSTOMER", "ADMIN"]);

/**
 * Users Table
 * Stores customer and administrator accounts with bcrypt-hashed passwords.
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: roleEnum("role").default("CUSTOMER").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
    index("idx_users_role").on(table.role),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Sanitized user type (without passwordHash) safe for client responses.
 */
export type SafeUser = Omit<User, "passwordHash">;
