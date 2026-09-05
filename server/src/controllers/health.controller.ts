import { Request, Response } from "express";
import { HealthService } from "../services/health.service";

/**
 * Controller for handling health check requests.
 * Route: GET /api/health
 */
export const getHealth = async (req: Request, res: Response): Promise<void> => {
  // Optional: Check Neon DB connection if query param ?checkDb=true is provided
  if (req.query.checkDb === "true") {
    const dbHealth = await HealthService.getDatabaseHealth();
    res.status(dbHealth.connected ? 200 : 503).json({
      success: dbHealth.connected,
      message: dbHealth.connected ? "API and Neon database are healthy" : "Database connection issue",
      database: dbHealth,
    });
    return;
  }

  // Standard Phase 1 health check response
  res.status(200).json({
    success: true,
    message: "API is running",
  });
};
