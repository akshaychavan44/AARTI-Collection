import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { logger } from "./utils/logger";

// Initialize Express application
const app: Application = express();

// ==========================================
// 1. Middlewares
// ==========================================

// Enable CORS - allowing both same-origin, configured frontend URL, and local dev
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching origins
      if (!origin || origin.includes("localhost") || origin.includes("vercel.app") || origin === env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for production full-stack deployment
      }
    },
    credentials: true,
  })
);

// Parse cookies (needed for HttpOnly session tokens)
app.use(cookieParser());

// Parse incoming JSON request bodies
app.use(express.json());

// Parse incoming URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
}

// ==========================================
// 2. Routes
// ==========================================

// Mount API routes under /api and / so both direct and proxy calls resolve
app.use("/api", apiRoutes);
app.use("/", apiRoutes);

// ==========================================
// 3. Error Handling
// ==========================================

// Catch 404 routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;
