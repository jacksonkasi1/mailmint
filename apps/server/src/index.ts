// ** Core Packages
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

// ** Routes
import { routes } from "@/routes";

// ** Config
import { env, isDevelopment, isProduction } from "@/config/environment";

// ** Types
import type { ErrorResponse } from "@/types/common";

// ** Utils
import { logger } from "@repo/logs";

// Initialize Hono app with TypeScript support
const app = new Hono();

// Load environment-specific configuration
const loadEnvironmentConfig = () => {
  try {
    if (isDevelopment) {
      logger.info("Loading development environment configuration");
    } else if (isProduction) {
      logger.info("Loading production environment configuration");
    }

    logger.info("Environment configuration loaded", {
      environment: env.NODE_ENV,
      corsOrigins: env.CORS_ORIGINS.join(", ") || "None configured",
      logLevel: env.LOG_LEVEL,
    });
  } catch (error) {
    logger.error("Failed to load environment configuration", error);
    throw error;
  }
};

// Middleware setup
app.use("*", honoLogger());
app.use("*", prettyJSON());

// CORS configuration with environment-specific origins
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow requests without origin (e.g., mobile apps, curl, Postman)
      if (!origin) return origin;

      // In development, allow configured localhost origins
      if (isDevelopment) {
        return env.CORS_ORIGINS.includes(origin) ? origin : null;
      }

      // In production, be more restrictive
      if (isProduction) {
        if (env.CORS_ORIGINS.length === 0) {
          logger.warn("No CORS origins configured for production environment");
          return null;
        }
        return env.CORS_ORIGINS.includes(origin) ? origin : null;
      }

      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposeHeaders: ["X-Total-Count", "X-Page-Count"],
    credentials: true,
    maxAge: isDevelopment ? 0 : 86400, // 24 hours in production, no cache in development
  })
);

// Mount all routes
app.route("/", routes);

// Error handling middleware
app.onError((err, c) => {
  logger.error("Application error", err, {
    path: c.req.path,
    method: c.req.method,
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: isDevelopment ? err.message : "Internal server error",
    timestamp: new Date().toISOString(),
  };
  return c.json(errorResponse, 500);
});

// 404 handler
app.notFound((c) => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: "Route not found",
    timestamp: new Date().toISOString(),
  };

  logger.warn("404 - Route not found", {
    path: c.req.path,
    method: c.req.method,
  });
  return c.json(errorResponse, 404);
});

// Initialize environment configuration
loadEnvironmentConfig();

// Start the server (for Cloud Run and local development)
const port = Number(process.env.PORT) || 8080;

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    logger.info("🚀 Server running", {
      url: `http://localhost:${info.port}`,
      healthCheck: `http://localhost:${info.port}/health`,
      corsOrigins: env.CORS_ORIGINS.join(", "),
      logLevel: env.LOG_LEVEL,
      environment: env.NODE_ENV,
    });
  }
);

// Export the app for testing purposes
export default app;
