import dotenv from "dotenv";
import { envSchema } from "../validations/env.validation";

// Load environment variables from .env file into process.env
dotenv.config();

// Parse and validate environment variables
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    // In production we might exit immediately, but during development we show helpful warnings
    throw new Error("Invalid environment configuration. Please check your .env file.");
  }

  return result.data;
};

export const env = parseEnv();
