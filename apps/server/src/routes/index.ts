// ** Core Packages
import { Hono } from "hono";
import type { Context } from "hono";

// ** Routes
import { userRoutes } from "./user";
import { authRoutes } from "./auth";

// ** Config
import { env } from "@/config/environment";

// ** Types
import type { HealthResponse } from "@/types/common";

// ** Utils
import { formatResponse } from "@/utils/formatters";
import { logger } from "@repo/logs";

// Create main routes
const routes = new Hono();

// Health check route with environment information
routes.get("/health", (c: Context) => {
  const response: HealthResponse = formatResponse({
    status: "healthy",
    version: env.FUNCTION_VERSION || "1.0.0",
    region: env.FUNCTION_REGION || "local",
    memory: env.FUNCTION_MEMORY || "1GB",
    environment: env.NODE_ENV,
    cors_origins: env.CORS_ORIGINS,
  });

  logger.info("Health check requested");
  return c.json(response);
});

// Root route with API documentation
routes.get("/", (c: Context) => {
  const response = formatResponse({
    message: "GCP TypeScript Hono.js Serverless API",
    version: "2.0.0",
    environment: env.NODE_ENV,
    cors_enabled: true,
    cors_origins: env.CORS_ORIGINS,
  });

  logger.info("Root endpoint accessed");
  return c.json(response);
});

// Mount sub-routes
routes.route("/api/auth", authRoutes);
routes.route("/api/users", userRoutes);

export { routes };
