import { pgTable, serial, integer, varchar, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Password Reset Tokens Table
 * Stores cryptographically secure tokens with expiration timestamps for password recovery.
 */
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    used: boolean("used").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_reset_tokens_token").on(table.token),
    index("idx_reset_tokens_user").on(table.userId),
  ]
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
