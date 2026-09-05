import { z } from "zod";

/**
 * Schema to validate environment variables on application startup.
 * Ensures all required environment variables exist and have valid formats.
 */
export const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, { message: "DATABASE_URL is required" }),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(16, { message: "JWT_SECRET must be at least 16 characters long" }).default("super_secret_jwt_key_kalyan_kids_2026_auth_system"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  // Razorpay Test Mode Configurations
  RAZORPAY_KEY_ID: z.string().optional().default("rzp_test_placeholder_key"),
  RAZORPAY_KEY_SECRET: z.string().optional().default("rzp_test_placeholder_secret"),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default("rzp_webhook_secret_placeholder"),
  // Resend Transactional Email Configurations
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional().default("orders@kalyankids.com"),
});

export type EnvConfig = z.infer<typeof envSchema>;
