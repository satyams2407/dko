import { FieldValue } from "firebase-admin/firestore";
import type { Response } from "@dko/shared";
import { adminDb } from "../config/firebase.js";
import { serializeDocument } from "../utils/firestore.js";

const responsesCollection = adminDb.collection("responses");

function sortByCreatedAtAscending(items: Response[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return leftTime - rightTime;
  });
}

export const responsesRepository = {
  async listByQueryId(queryId: string) {
    const snapshot = await responsesCollection.where("queryId", "==", queryId).get();

    return sortByCreatedAtAscending(
      snapshot.docs.map((document) => serializeDocument<Response>(document.id, document.data()))
    );
  },

  async createPendingAcknowledgement(queryId: string) {
    const reference = responsesCollection.doc();
    await reference.set({
      responseId: reference.id,
      queryId,
      type: "ai",
      content: "Your query has been received and is pending AI processing.",
      generatedBy: "system",
      confidence: 0,
      audioUrl: null,
      createdAt: FieldValue.serverTimestamp()
    });

    const saved = await reference.get();
    return serializeDocument<Response>(saved.id, saved.data() ?? {});
  },

  async createAiResponse(input: {
    queryId: string;
    content: string;
    generatedBy: string;
    confidence: number;
    audioUrl?: string | null;
  }) {
    const reference = responsesCollection.doc();
    await reference.set({
      responseId: reference.id,
      queryId: input.queryId,
      type: "ai",
      content: input.content,
      generatedBy: input.generatedBy,
      confidence: input.confidence,
      audioUrl: input.audioUrl ?? null,
      createdAt: FieldValue.serverTimestamp()
    });

    const saved = await reference.get();
    return serializeDocument<Response>(saved.id, saved.data() ?? {});
  },

  async createOfficerResponse(input: {
    queryId: string;
    content: string;
    officerId: string;
    officerName?: string;
  }) {
    const reference = responsesCollection.doc();
    await reference.set({
      responseId: reference.id,
      queryId: input.queryId,
      type: "officer",
      content: input.content,
      officerId: input.officerId,
      officerName: input.officerName ?? null,
      audioUrl: null,
      createdAt: FieldValue.serverTimestamp()
    });

    const saved = await reference.get();
    return serializeDocument<Response>(saved.id, saved.data() ?? {});
  }
};
