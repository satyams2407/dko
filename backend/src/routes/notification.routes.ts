import { Router } from "express";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../controllers/notification.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const notificationRouter = Router();

notificationRouter.use(authenticateToken);
notificationRouter.get("/", asyncHandler(listNotifications));
notificationRouter.post("/read-all", asyncHandler(markAllNotificationsRead));
notificationRouter.post("/:id/read", asyncHandler(markNotificationRead));
