import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../db";
import { users, passwordResetTokens, SafeUser, User } from "../db/schema";
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validations/auth.validation";
import { env } from "../config/env";

export interface AuthSession {
  user: SafeUser;
  token: string;
}

export class AuthService {
  /**
   * Helper to strip sensitive passwordHash from user object.
   */
  public static sanitizeUser(user: User): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Generates a signed JWT for an authenticated user session.
   */
  public static generateToken(userId: number, role: "CUSTOMER" | "ADMIN"): string {
    return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Registers a new user, hashes their password, and creates a session.
   */
  public static async register(data: RegisterInput): Promise<AuthSession> {
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("An account with this email address already exists.");
    }

    // Hash the password securely with bcrypt
    const passwordHash = await bcrypt.hash(data.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: normalizedEmail,
        passwordHash,
        role: data.role || "CUSTOMER",
        isActive: true,
      })
      .returning();

    const token = this.generateToken(newUser.id, newUser.role);
    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  /**
   * Authenticates user with email and password.
   */
  public static async login(data: LoginInput): Promise<AuthSession> {
    const normalizedEmail = data.email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (!user.isActive) {
      throw new Error("Your account has been deactivated. Please contact support.");
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    const token = this.generateToken(user.id, user.role);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Retrieves current authenticated user record.
   */
  public static async getMe(userId: number): Promise<SafeUser | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Updates user profile fields.
   */
  public static async updateProfile(userId: number, data: UpdateProfileInput): Promise<SafeUser> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new Error("User not found.");
    }

    const [updated] = await db
      .update(users)
      .set({
        ...(data.name && { name: data.name }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return this.sanitizeUser(updated);
  }

  /**
   * Initiates forgot password flow.
   * Protects against account enumeration by always returning a generic success message.
   */
  public static async forgotPassword(data: ForgotPasswordInput): Promise<{ message: string; resetToken?: string }> {
    const normalizedEmail = data.email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      // Return ambiguous message to prevent email enumeration
      return {
        message: "If an account with this email exists, password reset instructions have been sent.",
      };
    }

    // Generate secure reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
      used: false,
    });

    console.log(`🔑 [DEV INFO] Password reset token for ${user.email}: ${token}`);

    return {
      message: "If an account with this email exists, password reset instructions have been sent.",
      ...(env.NODE_ENV === "development" && { resetToken: token }),
    };
  }

  /**
   * Resets password using valid, unexpired token.
   */
  public static async resetPassword(data: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
    const now = new Date();

    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, data.token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!tokenRecord) {
      throw new Error("Invalid, expired, or already used password reset token.");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(data.newPassword, 10);

    // Update user password
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, tokenRecord.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    return {
      success: true,
      message: "Your password has been successfully reset. You may now log in with your new credentials.",
    };
  }
}
