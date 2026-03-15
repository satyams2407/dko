import { FieldValue } from "firebase-admin/firestore";
import type { Notification, NotificationType } from "@dko/shared";
import { adminDb } from "../config/firebase.js";
import { serializeDocument } from "../utils/firestore.js";

const notificationsCollection = adminDb.collection("notifications");

function sortByCreatedAtDescending(items: Notification[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export const notificationsRepository = {
  async create(input: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    queryId?: string | null;
    escalationId?: string | null;
  }) {
    const reference = notificationsCollection.doc();
    await reference.set({
      notificationId: reference.id,
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      queryId: input.queryId ?? null,
      escalationId: input.escalationId ?? null,
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
      readAt: null
    });

    const saved = await reference.get();
    return serializeDocument<Notification>(saved.id, saved.data() ?? {});
  },

  async listByUserId(userId: string, unreadOnly = false) {
    const snapshot = await notificationsCollection.where("userId", "==", userId).get();
    const items = sortByCreatedAtDescending(
      snapshot.docs.map((document) => serializeDocument<Notification>(document.id, document.data()))
    );

    return unreadOnly ? items.filter((item) => !item.isRead) : items;
  },

  async countUnread(userId: string) {
    const items = await this.listByUserId(userId, true);
    return items.length;
  },

  async markRead(notificationId: string, userId: string) {
    const reference = notificationsCollection.doc(notificationId);
    const snapshot = await reference.get();
    if (!snapshot.exists) {
      return null;
    }

    const current = serializeDocument<Notification>(snapshot.id, snapshot.data() ?? {});
    if (current.userId !== userId) {
      return null;
    }

    await reference.set(
      {
        isRead: true,
        readAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    const saved = await reference.get();
    return serializeDocument<Notification>(saved.id, saved.data() ?? {});
  },

  async markAllRead(userId: string) {
    const items = await this.listByUserId(userId);
    await Promise.all(
      items.filter((item) => !item.isRead).map((item) =>
        notificationsCollection.doc(item.notificationId).set(
          {
            isRead: true,
            readAt: FieldValue.serverTimestamp()
          },
          { merge: true }
        )
      )
    );
  }
};
