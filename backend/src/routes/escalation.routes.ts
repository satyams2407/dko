import { Router } from "express";
import {
  assignEscalation,
  getEscalationById,
  listEscalations,
  respondToEscalation
} from "../controllers/escalation.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const escalationRouter = Router();

escalationRouter.use(authenticateToken, requireRole("officer", "admin"));
escalationRouter.get("/", asyncHandler(listEscalations));
escalationRouter.get("/:id", asyncHandler(getEscalationById));
escalationRouter.put("/:id/assign", asyncHandler(assignEscalation));
escalationRouter.post("/:id/respond", asyncHandler(respondToEscalation));
