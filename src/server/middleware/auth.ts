import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { db } from "../db";
import { users, SafeUser } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthService } from "../services/auth.service";

// Extend Express Request interface to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

interface JwtPayload {
  id: number;
  role: "CUSTOMER" | "ADMIN";
}

/**
 * Middleware to authenticate requests via HttpOnly cookie or Bearer token header.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization Header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in to access this resource.",
      });
      return;
    }

    // Verify JWT
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (jwtErr) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired session. Please log in again.",
      });
      return;
    }

    // Fetch user from DB
    const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Account not found or has been deactivated.",
      });
      return;
    }

    req.user = AuthService.sanitizeUser(user);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access based on user role (RBAC).
 * Example: requireRole("ADMIN")
 */
export const requireRole = (...allowedRoles: ("CUSTOMER" | "ADMIN")[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(", ")}].`,
      });
      return;
    }

    next();
  };
};
