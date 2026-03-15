import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { escalationRouter } from "./routes/escalation.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { queryRouter } from "./routes/query.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true
    })
  );
  app.use(morgan("dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (_request, response) => {
    response.json({
      service: "Digital Krishi Officer API",
      version: "0.4.0",
      docs: "/health"
    });
  });

  app.use(healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/queries", queryRouter);
  app.use("/api/escalations", escalationRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/analytics", analyticsRouter);

  app.use((request, response) => {
    response.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Route not found: ${request.method} ${request.originalUrl}`
      }
    });
  });

  app.use(
    (
      error: Error,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(error);
      response.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred."
        }
      });
    }
  );

  return app;
}
