import type { Escalation, Query } from "@dko/shared";
import { escalationsRepository } from "../repositories/escalations.repository.js";
import { notificationsRepository } from "../repositories/notifications.repository.js";
import { queriesRepository } from "../repositories/queries.repository.js";
import { usersRepository } from "../repositories/users.repository.js";

function buildPreview(query: Query) {
  if (query.type === "text") {
    return query.content?.trim() || "Text advisory request";
  }

  if (query.type === "voice") {
    return query.transcribedText?.trim() || query.description?.trim() || "Voice advisory request";
  }

  return query.detectedDisease?.trim() || query.description?.trim() || "Image advisory request";
}

function inferPriority(reason: string, confidence?: number) {
  const normalized = reason.toLowerCase();
  if (normalized.includes("urgent") || normalized.includes("rapid") || normalized.includes("wilt") || (confidence ?? 100) < 55) {
    return "high" as const;
  }

  if ((confidence ?? 100) < 65) {
    return "normal" as const;
  }

  return "low" as const;
}

export const escalationService = {
  async ensureEscalation(input: { query: Query; reason: string; confidence?: number }) {
    const existing = await escalationsRepository.findByQueryId(input.query.queryId);
    if (existing) {
      await queriesRepository.markEscalated(input.query.queryId);
      return existing;
    }

    const farmer = await usersRepository.findById(input.query.userId);
    const escalation = await escalationsRepository.create({
      queryId: input.query.queryId,
      userId: input.query.userId,
      queryType: input.query.type,
      reason: input.reason,
      priority: inferPriority(input.reason, input.confidence ?? input.query.confidence),
      farmerName: farmer?.name,
      queryPreview: buildPreview(input.query)
    });

    await queriesRepository.markEscalated(input.query.queryId);
    await notificationsRepository.create({
      userId: input.query.userId,
      type: "escalation_created",
      title: "Your query is under officer review",
      message: "The AI answer needs human review. An agricultural officer will look at your case.",
      queryId: input.query.queryId,
      escalationId: escalation.escalationId
    });

    return escalation;
  }
};
