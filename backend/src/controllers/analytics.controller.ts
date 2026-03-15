import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service.js";
import { sendSuccess } from "../utils/http.js";

export async function getAnalyticsOverview(_request: Request, response: Response) {
  const overview = await analyticsService.getOverview();
  return sendSuccess(response, overview);
}
