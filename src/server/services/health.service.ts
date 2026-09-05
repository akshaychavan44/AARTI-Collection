import { testDatabaseConnection, DatabaseHealthResult } from "../db/testConnection";

export interface HealthStatus {
  status: string;
  uptime: number;
  timestamp: string;
  database?: DatabaseHealthResult;
}

/**
 * Service to handle health check business logic.
 */
export class HealthService {
  /**
   * Returns basic system health metrics.
   */
  public static getBasicHealth(): HealthStatus {
    return {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Performs an asynchronous check on Neon PostgreSQL database health.
   */
  public static async getDatabaseHealth(): Promise<DatabaseHealthResult> {
    return await testDatabaseConnection();
  }
}
