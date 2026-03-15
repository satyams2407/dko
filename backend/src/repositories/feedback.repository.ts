import { FieldValue } from "firebase-admin/firestore";
import type { Feedback, FeedbackRating } from "@dko/shared";
import { adminDb } from "../config/firebase.js";
import { serializeDocument } from "../utils/firestore.js";

const feedbackCollection = adminDb.collection("feedback");

export const feedbackRepository = {
  async create(input: {
    queryId: string;
    responseId: string;
    userId: string;
    rating: FeedbackRating;
    comment?: string;
  }) {
    const reference = feedbackCollection.doc();

    await reference.set({
      feedbackId: reference.id,
      queryId: input.queryId,
      responseId: input.responseId,
      userId: input.userId,
      rating: input.rating,
      comment: input.comment ?? null,
      createdAt: FieldValue.serverTimestamp()
    });

    const saved = await reference.get();
    return serializeDocument<Feedback>(saved.id, saved.data() ?? {});
  },

  async findLatestByQueryAndUser(queryId: string, userId: string) {
    const snapshot = await feedbackCollection.where("queryId", "==", queryId).where("userId", "==", userId).get();
    const items = snapshot.docs
      .map((document) => serializeDocument<Feedback>(document.id, document.data()))
      .sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        return rightTime - leftTime;
      });

    return items[0] ?? null;
  }
};
