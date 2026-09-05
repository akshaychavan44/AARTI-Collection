import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { logger } from "./utils/logger";
import { testDatabaseConnection } from "./db/testConnection";

// Initialize Express application
const app: Application = express();

// ==========================================
// 1. Middlewares
// ==========================================

// Enable Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
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

// Mount all API routes under /api
app.use("/api", apiRoutes);

// ==========================================
// 3. Error Handling
// ==========================================

// Catch 404 routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

// ==========================================
// 4. Start Server
// ==========================================

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  logger.info(`🩺 Health check URL: http://localhost:${env.PORT}/api/health`);

  // Run initial Neon database connection check
  const dbStatus = await testDatabaseConnection();
  if (dbStatus.connected) {
    logger.success(dbStatus.message);
  } else {
    logger.warn(`Database Notice: ${dbStatus.message}`);
    if (dbStatus.error) {
      logger.error(`Connection details: ${dbStatus.error}`);
    }
  }
});

export default app;
