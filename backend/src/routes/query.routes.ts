import { Router } from "express";
import {
  createQuery,
  getQueryById,
  listQueriesByUser,
  submitQueryFeedback,
  translateQueryResponse
} from "../controllers/query.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const queryRouter = Router();

queryRouter.use(authenticateToken);
queryRouter.post("/", asyncHandler(createQuery));
queryRouter.get("/user/:userId", asyncHandler(listQueriesByUser));
queryRouter.get("/:id", asyncHandler(getQueryById));
queryRouter.post("/:id/translate", asyncHandler(translateQueryResponse));
queryRouter.post("/:id/feedback", asyncHandler(submitQueryFeedback));
