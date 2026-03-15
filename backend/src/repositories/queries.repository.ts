import { FieldValue } from "firebase-admin/firestore";
import type { Query, QueryStatus, QueryType } from "@dko/shared";
import { adminDb } from "../config/firebase.js";
import { serializeDocument } from "../utils/firestore.js";

interface CreateQueryInput {
  userId: string;
  type: QueryType;
  content?: string;
  audioUrl?: string;
  imageUrl?: string;
  description?: string;
  transcribedText?: string;
  detectedDisease?: string;
  diseaseConfidence?: number;
  status?: QueryStatus;
}

interface MarkAnsweredInput {
  latestResponse: string;
  confidence: number;
  aiResponseAudioUrl?: string | null;
  transcribedText?: string;
  detectedDisease?: string;
  diseaseConfidence?: number;
  status?: QueryStatus;
}

const queriesCollection = adminDb.collection("queries");

function sortByCreatedAtDescending(items: Query[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export const queriesRepository = {
  async create(input: CreateQueryInput) {
    const reference = queriesCollection.doc();

    await reference.set({
      queryId: reference.id,
      userId: input.userId,
      type: input.type,
      content: input.content ?? null,
      audioUrl: input.audioUrl ?? null,
      imageUrl: input.imageUrl ?? null,
      description: input.description ?? null,
      transcribedText: input.transcribedText ?? null,
      detectedDisease: input.detectedDisease ?? null,
      diseaseConfidence: input.diseaseConfidence ?? null,
      status: input.status ?? "pending",
      latestResponse: null,
      confidence: null,
      aiResponseAudioUrl: null,
      createdAt: FieldValue.serverTimestamp(),
      answeredAt: null,
      escalatedAt: null,
      resolvedAt: null
    });

    const snapshot = await reference.get();
    return serializeDocument<Query>(snapshot.id, snapshot.data() ?? {});
  },

  async markAnswered(queryId: string, input: MarkAnsweredInput) {
    const status = input.status ?? "answered";
    const reference = queriesCollection.doc(queryId);
    await reference.set(
      {
        status,
        latestResponse: input.latestResponse,
        confidence: input.confidence,
        aiResponseAudioUrl: input.aiResponseAudioUrl ?? null,
        transcribedText: input.transcribedText ?? FieldValue.delete(),
        detectedDisease: input.detectedDisease ?? FieldValue.delete(),
        diseaseConfidence: input.diseaseConfidence ?? FieldValue.delete(),
        answeredAt: FieldValue.serverTimestamp(),
        escalatedAt: status === "escalated" ? FieldValue.serverTimestamp() : FieldValue.delete(),
        resolvedAt: status === "resolved" ? FieldValue.serverTimestamp() : FieldValue.delete()
      },
      { merge: true }
    );

    const snapshot = await reference.get();
    return serializeDocument<Query>(snapshot.id, snapshot.data() ?? {});
  },

  async markEscalated(queryId: string) {
    const reference = queriesCollection.doc(queryId);
    await reference.set(
      {
        status: "escalated",
        escalatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    const snapshot = await reference.get();
    return serializeDocument<Query>(snapshot.id, snapshot.data() ?? {});
  },

  async markResolved(queryId: string, latestResponse?: string) {
    const reference = queriesCollection.doc(queryId);
    await reference.set(
      {
        status: "resolved",
        latestResponse: latestResponse ?? FieldValue.delete(),
        resolvedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    const snapshot = await reference.get();
    return serializeDocument<Query>(snapshot.id, snapshot.data() ?? {});
  },

  async findById(queryId: string) {
    const snapshot = await queriesCollection.doc(queryId).get();
    if (!snapshot.exists) {
      return null;
    }

    return serializeDocument<Query>(snapshot.id, snapshot.data() ?? {});
  },

  async listByUserId(userId: string, limit = 20, cursor?: string | null) {
    const snapshot = await queriesCollection.where("userId", "==", userId).get();
    const allItems = sortByCreatedAtDescending(
      snapshot.docs.map((document) => serializeDocument<Query>(document.id, document.data()))
    );

    const startIndex = cursor ? Math.max(allItems.findIndex((item) => item.queryId === cursor) + 1, 0) : 0;
    const items = allItems.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < allItems.length ? items[items.length - 1]?.queryId ?? null : null;

    return {
      items,
      nextCursor
    };
  }
};
