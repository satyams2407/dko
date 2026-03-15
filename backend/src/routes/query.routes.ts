import { Router } from "express";
import {
  createQuery,
  getQueryById,
  listQueriesByUser,
  submitQueryFeedback
} from "../controllers/query.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const queryRouter = Router();

queryRouter.use(authenticateToken);
queryRouter.post("/", asyncHandler(createQuery));
queryRouter.get("/user/:userId", asyncHandler(listQueriesByUser));
queryRouter.get("/:id", asyncHandler(getQueryById));
queryRouter.post("/:id/feedback", asyncHandler(submitQueryFeedback));
