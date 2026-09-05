import { z } from "zod";

/**
 * Schema for User Registration
 */
export const registerSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters long" }).max(100),
  email: z.string().trim().email({ message: "Please provide a valid email address" }).toLowerCase(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password must not exceed 100 characters" }),
  role: z.enum(["CUSTOMER", "ADMIN"]).optional().default("CUSTOMER"),
});

/**
 * Schema for User Login
 */
export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).toLowerCase(),
  password: z.string().min(1, { message: "Password is required" }),
});

/**
 * Schema for Updating User Profile
 */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters long" }).max(100).optional(),
});

/**
 * Schema for Forgot Password Request
 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).toLowerCase(),
});

/**
 * Schema for Password Reset with Token
 */
export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10, { message: "Invalid or missing reset token" }),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters long" })
    .max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
