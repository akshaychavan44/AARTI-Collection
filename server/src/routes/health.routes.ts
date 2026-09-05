import { Router } from "express";
import { getHealth } from "../controllers/health.controller";

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Check if backend service is live and responsive
 * @access  Public
 */
router.get("/health", getHealth);

export default router;
