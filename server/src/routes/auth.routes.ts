import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation";

const router = Router();

// ==========================================
// Public Authentication Routes
// ==========================================

// POST /api/auth/register - Register new account
router.post("/register", validate(registerSchema, "body"), AuthController.register);

// POST /api/auth/login - Sign in with credentials
router.post("/login", validate(loginSchema, "body"), AuthController.login);

// POST /api/auth/logout - Clear session
router.post("/logout", AuthController.logout);

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", validate(forgotPasswordSchema, "body"), AuthController.forgotPassword);

// POST /api/auth/reset-password - Complete password reset with token
router.post("/reset-password", validate(resetPasswordSchema, "body"), AuthController.resetPassword);

// ==========================================
// Protected User Routes (Require Active Session)
// ==========================================

// GET /api/auth/me - Get current logged-in user profile
router.get("/me", requireAuth, AuthController.getMe);

// PUT /api/auth/profile - Update current user profile
router.put("/profile", requireAuth, validate(updateProfileSchema, "body"), AuthController.updateProfile);

export default router;
