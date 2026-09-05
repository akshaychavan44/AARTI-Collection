import { sql } from "./index";
import { env } from "../config/env";

export interface DatabaseHealthResult {
  connected: boolean;
  message: string;
  serverTime?: string;
  error?: string;
}

/**
 * Executes a lightweight query against Neon PostgreSQL to verify connectivity.
 * 
 * @returns {Promise<DatabaseHealthResult>} Result with connection status and details.
 */
export async function testDatabaseConnection(): Promise<DatabaseHealthResult> {
  // Check if DATABASE_URL contains placeholder values
  if (
    env.DATABASE_URL.includes("your_password_here") ||
    env.DATABASE_URL.includes("ep-example")
  ) {
    return {
      connected: false,
      message:
        "DATABASE_URL contains placeholder values. Please update server/.env with your actual Neon PostgreSQL connection string.",
    };
  }

  try {
    // Run a lightweight test query to confirm Neon PostgreSQL response
    const result = await sql`SELECT 1 AS is_connected, NOW() AS server_time;`;
    const serverTime = result[0]?.server_time ? String(result[0].server_time) : undefined;

    return {
      connected: true,
      message: "Neon PostgreSQL connected successfully!",
      serverTime,
    };
  } catch (error: any) {
    return {
      connected: false,
      message: "Failed to connect to Neon PostgreSQL database.",
      error: error?.message || String(error),
    };
  }
}

// Execute directly if run via CLI (e.g., `npm run db:test`)
if (require.main === module) {
  console.log("🔍 Testing Neon PostgreSQL connection...");
  testDatabaseConnection()
    .then((res) => {
      if (res.connected) {
        console.log("✅ " + res.message);
        if (res.serverTime) {
          console.log("🕒 Neon Server Time:", res.serverTime);
        }
        process.exit(0);
      } else {
        console.error("❌ " + res.message);
        if (res.error) {
          console.error("   Details:", res.error);
        }
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error("❌ Unexpected error during connection test:", err);
      process.exit(1);
    });
}
