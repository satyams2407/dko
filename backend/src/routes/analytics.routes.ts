import { Router } from "express";
import { getAnalyticsOverview } from "../controllers/analytics.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const analyticsRouter = Router();

analyticsRouter.use(authenticateToken, requireRole("officer", "admin"));
analyticsRouter.get("/overview", asyncHandler(getAnalyticsOverview));
