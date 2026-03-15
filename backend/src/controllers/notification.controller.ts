import type { Request, Response } from "express";
import { notificationsRepository } from "../repositories/notifications.repository.js";
import { sendError, sendSuccess } from "../utils/http.js";

export async function listNotifications(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const unreadOnly = request.query.unreadOnly === "true";
  const items = await notificationsRepository.listByUserId(request.authUser.uid, unreadOnly);
  const unreadCount = await notificationsRepository.countUnread(request.authUser.uid);

  return sendSuccess(response, { items, unreadCount });
}

export async function markNotificationRead(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const notificationId = request.params.id;
  if (typeof notificationId !== "string") {
    return sendError(response, 400, "VALIDATION_ERROR", "Notification ID is required.");
  }

  const notification = await notificationsRepository.markRead(notificationId, request.authUser.uid);
  if (!notification) {
    return sendError(response, 404, "NOT_FOUND", "Notification not found.");
  }

  return sendSuccess(response, { notification });
}

export async function markAllNotificationsRead(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  await notificationsRepository.markAllRead(request.authUser.uid);
  return sendSuccess(response, { success: true });
}
