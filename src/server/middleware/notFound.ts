import { Request, Response, NextFunction } from "express";

/**
 * 404 Handler for undefined API routes.
 */
export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};
