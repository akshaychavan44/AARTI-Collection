import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { env } from "../config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  /**
   * POST /api/auth/register
   * Creates a new user account, sets HttpOnly cookie, and returns user data.
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await AuthService.register(req.body);

      // Set HttpOnly cookie for session persistence
      res.cookie("token", session.token, COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        message: "Registration successful. Welcome to Kalyan Kids!",
        data: session,
      });
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticates user, sets HttpOnly cookie, and returns user data.
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await AuthService.login(req.body);

      // Set HttpOnly cookie for session persistence
      res.cookie("token", session.token, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: "Login successful.",
        data: session,
      });
    } catch (error: any) {
      if (
        error.message?.includes("Invalid email or password") ||
        error.message?.includes("deactivated")
      ) {
        res.status(401).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Clears session cookie.
   */
  public static async logout(_req: Request, res: Response): Promise<void> {
    const { maxAge: _unused, ...clearOptions } = COOKIE_OPTIONS;
    res.clearCookie("token", clearOptions);
    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  }

  /**
   * GET /api/auth/me
   * Returns currently authenticated user details.
   */
  public static async getMe(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  }

  /**
   * PUT /api/auth/profile
   * Updates user name / profile attributes.
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const updatedUser = await AuthService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Generates secure reset token and isolates email sending flow.
   */
  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Resets password given a valid token.
   */
  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message?.includes("Invalid, expired")) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}
