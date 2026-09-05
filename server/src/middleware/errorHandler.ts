import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/**
 * Global error-handling middleware.
 * Captures all unhandled exceptions from routes and controllers
 * and returns a standardized JSON response.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || "Internal Server Error";

  // PostgreSQL Error Handling
  if (err.code === "23505") {
    // Unique violation (e.g., duplicate slug or SKU)
    statusCode = 400;
    if (err.detail && err.detail.includes("sku")) {
      message = "A product variant with this SKU already exists.";
    } else if (err.detail && err.detail.includes("slug")) {
      message = "A resource with this slug already exists.";
    } else {
      message = "Duplicate entry: This resource already exists.";
    }
  } else if (err.code === "23503") {
    // Foreign key violation (e.g., non-existent categoryId)
    statusCode = 400;
    message = "Referenced resource not found or cannot be modified due to foreign key constraints.";
  } else if (err.code === "22P02") {
    // Invalid input syntax for integer / uuid
    statusCode = 400;
    message = "Invalid input format provided.";
  }

  logger.error(`[${req.method}] ${req.originalUrl} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    // In development mode, include stack trace to aid debugging
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
