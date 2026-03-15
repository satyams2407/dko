import type { AnalyticsOverview, Escalation, Notification, Query } from "@dko/shared";
import { adminDb } from "../config/firebase.js";
import { serializeDocument } from "../utils/firestore.js";

function sortByTimestampDescending<T extends { timestamp?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.timestamp ? new Date(left.timestamp).getTime() : 0;
    const rightTime = right.timestamp ? new Date(right.timestamp).getTime() : 0;
    return rightTime - leftTime;
  });
}

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    const [queriesSnapshot, escalationsSnapshot, notificationsSnapshot] = await Promise.all([
      adminDb.collection("queries").get(),
      adminDb.collection("escalations").get(),
      adminDb.collection("notifications").get()
    ]);

    const queries = queriesSnapshot.docs.map((document) => serializeDocument<Query>(document.id, document.data()));
    const escalations = escalationsSnapshot.docs.map((document) => serializeDocument<Escalation>(document.id, document.data()));
    const notifications = notificationsSnapshot.docs.map((document) => serializeDocument<Notification>(document.id, document.data()));

    const queryTypeBreakdown = ["text", "voice", "image"].map((type) => ({
      type: type as Query["type"],
      count: queries.filter((query) => query.type === type).length
    }));

    const recentActivity = sortByTimestampDescending([
      ...queries.map((query) => ({
        label: `${query.type} query submitted`,
        timestamp: query.createdAt,
        category: "query" as const
      })),
      ...escalations.map((escalation) => ({
        label: `Escalation ${escalation.status.replace("_", " ")}`,
        timestamp: escalation.createdAt,
        category: "escalation" as const
      })),
      ...notifications.map((notification) => ({
        label: notification.title,
        timestamp: notification.createdAt,
        category: "notification" as const
      }))
    ]).slice(0, 8);

    return {
      totalQueries: queries.length,
      answeredQueries: queries.filter((query) => query.status === "answered").length,
      escalatedQueries: queries.filter((query) => query.status === "escalated").length,
      resolvedQueries: queries.filter((query) => query.status === "resolved").length,
      totalEscalations: escalations.length,
      openEscalations: escalations.filter((item) => item.status !== "resolved").length,
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter((item) => !item.isRead).length,
      queryTypeBreakdown,
      recentActivity
    };
  }
};
