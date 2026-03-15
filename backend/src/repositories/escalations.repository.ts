import { FieldValue } from "firebase-admin/firestore";
import type { Escalation, EscalationStatus } from "@dko/shared";
import { adminDb } from "../config/firebase.js";
import { serializeDocument } from "../utils/firestore.js";

const escalationsCollection = adminDb.collection("escalations");

function sortByCreatedAtDescending(items: Escalation[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export const escalationsRepository = {
  async create(input: {
    queryId: string;
    userId: string;
    queryType: Escalation["queryType"];
    reason: string;
    priority: Escalation["priority"];
    farmerName?: string;
    queryPreview?: string;
  }) {
    const reference = escalationsCollection.doc();

    await reference.set({
      escalationId: reference.id,
      queryId: input.queryId,
      userId: input.userId,
      queryType: input.queryType,
      reason: input.reason,
      priority: input.priority,
      status: "pending",
      assignedTo: null,
      assignedAt: null,
      responseId: null,
      createdAt: FieldValue.serverTimestamp(),
      resolvedAt: null,
      farmerName: input.farmerName ?? null,
      officerName: null,
      queryPreview: input.queryPreview ?? null
    });

    const saved = await reference.get();
    return serializeDocument<Escalation>(saved.id, saved.data() ?? {});
  },

  async findById(escalationId: string) {
    const snapshot = await escalationsCollection.doc(escalationId).get();
    if (!snapshot.exists) {
      return null;
    }

    return serializeDocument<Escalation>(snapshot.id, snapshot.data() ?? {});
  },

  async findByQueryId(queryId: string) {
    const snapshot = await escalationsCollection.where("queryId", "==", queryId).get();
    const items = sortByCreatedAtDescending(
      snapshot.docs.map((document) => serializeDocument<Escalation>(document.id, document.data()))
    );

    return items[0] ?? null;
  },

  async list(status?: EscalationStatus | "all") {
    const snapshot = status && status !== "all"
      ? await escalationsCollection.where("status", "==", status).get()
      : await escalationsCollection.get();

    return sortByCreatedAtDescending(
      snapshot.docs.map((document) => serializeDocument<Escalation>(document.id, document.data()))
    );
  },

  async assign(escalationId: string, input: { officerId: string; officerName?: string }) {
    const reference = escalationsCollection.doc(escalationId);
    await reference.set(
      {
        assignedTo: input.officerId,
        officerName: input.officerName ?? null,
        assignedAt: FieldValue.serverTimestamp(),
        status: "in_progress"
      },
      { merge: true }
    );

    const saved = await reference.get();
    return serializeDocument<Escalation>(saved.id, saved.data() ?? {});
  },

  async resolve(escalationId: string, input: { responseId: string; officerId: string; officerName?: string }) {
    const reference = escalationsCollection.doc(escalationId);
    await reference.set(
      {
        responseId: input.responseId,
        assignedTo: input.officerId,
        officerName: input.officerName ?? null,
        status: "resolved",
        resolvedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    const saved = await reference.get();
    return serializeDocument<Escalation>(saved.id, saved.data() ?? {});
  }
};
