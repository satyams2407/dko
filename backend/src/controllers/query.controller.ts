import type { Request, Response } from "express";
import { escalationsRepository } from "../repositories/escalations.repository.js";
import { feedbackRepository } from "../repositories/feedback.repository.js";
import { queriesRepository } from "../repositories/queries.repository.js";
import { responsesRepository } from "../repositories/responses.repository.js";
import {
  processImageQuery,
  processTextQuery,
  processVoiceQuery,
  translateAdvisory
} from "../services/ai/text-query.service.js";
import { escalationService } from "../services/escalation.service.js";
import { sendError, sendSuccess } from "../utils/http.js";

function isAllowedToView(requestUserId: string, requestRole: string, ownerId: string) {
  return requestRole === "officer" || requestRole === "admin" || requestUserId === ownerId;
}

function shouldEscalate(confidence: number, modelUsed: string) {
  return confidence < 60 || modelUsed === "fallback";
}

export async function createQuery(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const { type, content, audioUrl, audioMimeType, imageUrl, imageMimeType, description } = request.body as {
    type?: "text" | "voice" | "image";
    content?: string;
    audioUrl?: string;
    audioMimeType?: string;
    imageUrl?: string;
    imageMimeType?: string;
    description?: string;
  };

  if (!type || !["text", "voice", "image"].includes(type)) {
    return sendError(response, 400, "VALIDATION_ERROR", "Query type must be text, voice, or image.");
  }

  if (type === "text" && !content?.trim()) {
    return sendError(response, 400, "VALIDATION_ERROR", "Text query content is required.");
  }

  if (type === "voice" && !audioUrl?.trim()) {
    return sendError(response, 400, "VALIDATION_ERROR", "audioUrl is required for voice queries.");
  }

  if (type === "image" && !imageUrl?.trim()) {
    return sendError(response, 400, "VALIDATION_ERROR", "imageUrl is required for image queries.");
  }

  const query = await queriesRepository.create({
    userId: request.authUser.uid,
    type,
    content: content?.trim(),
    audioUrl,
    imageUrl,
    description: description?.trim(),
    status: "pending"
  });

  if (type === "text" && content) {
    const textResult = await processTextQuery(content.trim());
    const escalated = shouldEscalate(textResult.confidence, textResult.modelUsed);
    const savedResponse = await responsesRepository.createAiResponse({
      queryId: query.queryId,
      content: textResult.content,
      generatedBy: textResult.modelUsed,
      confidence: textResult.confidence,
      audioUrl: null
    });

    const updatedQuery = await queriesRepository.markAnswered(query.queryId, {
      latestResponse: textResult.content,
      confidence: textResult.confidence,
      aiResponseAudioUrl: null,
      status: escalated ? "escalated" : "answered"
    });

    const escalation = escalated
      ? await escalationService.ensureEscalation({
          query: updatedQuery,
          reason: "AI confidence was low for this text advisory.",
          confidence: textResult.confidence
        })
      : null;

    return sendSuccess(response, { query: updatedQuery, response: savedResponse, escalation }, 201);
  }

  if (type === "voice" && audioUrl) {
    const voiceResult = await processVoiceQuery({
      audioUrl,
      audioMimeType,
      description: description?.trim()
    });
    const escalated = shouldEscalate(voiceResult.confidence, voiceResult.modelUsed);

    const savedResponse = await responsesRepository.createAiResponse({
      queryId: query.queryId,
      content: voiceResult.content,
      generatedBy: voiceResult.modelUsed,
      confidence: voiceResult.confidence,
      audioUrl: null
    });

    const updatedQuery = await queriesRepository.markAnswered(query.queryId, {
      latestResponse: voiceResult.content,
      confidence: voiceResult.confidence,
      aiResponseAudioUrl: null,
      transcribedText: voiceResult.transcript,
      status: escalated ? "escalated" : "answered"
    });

    const escalation = escalated
      ? await escalationService.ensureEscalation({
          query: updatedQuery,
          reason: "AI confidence was low for this voice advisory.",
          confidence: voiceResult.confidence
        })
      : null;

    return sendSuccess(response, { query: updatedQuery, response: savedResponse, escalation }, 201);
  }

  if (type === "image" && imageUrl) {
    const imageResult = await processImageQuery({
      imageUrl,
      imageMimeType,
      description: description?.trim()
    });
    const escalated = shouldEscalate(imageResult.confidence, imageResult.modelUsed);

    const savedResponse = await responsesRepository.createAiResponse({
      queryId: query.queryId,
      content: imageResult.content,
      generatedBy: imageResult.modelUsed,
      confidence: imageResult.confidence,
      audioUrl: null
    });

    const updatedQuery = await queriesRepository.markAnswered(query.queryId, {
      latestResponse: imageResult.content,
      confidence: imageResult.confidence,
      aiResponseAudioUrl: null,
      detectedDisease: imageResult.detectedIssue,
      diseaseConfidence: imageResult.confidence,
      status: escalated ? "escalated" : "answered"
    });

    const escalation = escalated
      ? await escalationService.ensureEscalation({
          query: updatedQuery,
          reason: "AI confidence was low for this image advisory.",
          confidence: imageResult.confidence
        })
      : null;

    return sendSuccess(response, { query: updatedQuery, response: savedResponse, escalation }, 201);
  }

  const acknowledgement = await responsesRepository.createPendingAcknowledgement(query.queryId);
  return sendSuccess(response, { query, response: acknowledgement }, 201);
}

export async function getQueryById(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const queryId = request.params.id;
  if (typeof queryId !== "string") {
    return sendError(response, 400, "VALIDATION_ERROR", "Query ID is required.");
  }

  const query = await queriesRepository.findById(queryId);
  if (!query) {
    return sendError(response, 404, "NOT_FOUND", "Query not found.");
  }

  if (!isAllowedToView(request.authUser.uid, request.authUser.role, query.userId)) {
    return sendError(response, 403, "FORBIDDEN", "You do not have access to this query.");
  }

  const responses = await responsesRepository.listByQueryId(query.queryId);
  const escalation = await escalationsRepository.findByQueryId(query.queryId);
  return sendSuccess(response, { query, responses, escalation });
}

export async function listQueriesByUser(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const userId = request.params.userId;
  if (typeof userId !== "string") {
    return sendError(response, 400, "VALIDATION_ERROR", "User ID is required.");
  }

  if (!isAllowedToView(request.authUser.uid, request.authUser.role, userId)) {
    return sendError(response, 403, "FORBIDDEN", "You do not have access to these queries.");
  }

  const limit = Math.min(Number(request.query.limit ?? 20) || 20, 50);
  const cursor = typeof request.query.cursor === "string" ? request.query.cursor : undefined;
  const result = await queriesRepository.listByUserId(userId, limit, cursor);

  return sendSuccess(response, result);
}

export async function submitQueryFeedback(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const queryId = request.params.id;
  const { rating, comment, responseId } = request.body as {
    rating?: "helpful" | "not_helpful";
    comment?: string;
    responseId?: string;
  };

  if (typeof queryId !== "string") {
    return sendError(response, 400, "VALIDATION_ERROR", "Query ID is required.");
  }

  if (!rating || !["helpful", "not_helpful"].includes(rating)) {
    return sendError(response, 400, "VALIDATION_ERROR", "rating must be helpful or not_helpful.");
  }

  const query = await queriesRepository.findById(queryId);
  if (!query) {
    return sendError(response, 404, "NOT_FOUND", "Query not found.");
  }

  if (query.userId !== request.authUser.uid) {
    return sendError(response, 403, "FORBIDDEN", "You do not have access to this query.");
  }

  const responses = await responsesRepository.listByQueryId(queryId);
  const latestResponse = typeof responseId === "string"
    ? responses.find((item) => item.responseId === responseId)
    : responses[responses.length - 1];
  if (!latestResponse) {
    return sendError(response, 400, "VALIDATION_ERROR", "A response must exist before feedback can be submitted.");
  }

  const feedback = await feedbackRepository.create({
    queryId,
    responseId: latestResponse.responseId,
    userId: request.authUser.uid,
    rating,
    comment: comment?.trim()
  });

  const escalation = rating === "not_helpful"
    ? await escalationService.ensureEscalation({
        query,
        reason: comment?.trim() || "Farmer marked the AI response as not helpful.",
        confidence: query.confidence
      })
    : null;

  return sendSuccess(response, { feedback, escalation }, 201);
}

export async function translateQueryResponse(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const queryId = request.params.id;
  const { targetLanguage } = request.body as {
    targetLanguage?: "ml";
  };

  if (typeof queryId !== "string") {
    return sendError(response, 400, "VALIDATION_ERROR", "Query ID is required.");
  }

  if (targetLanguage !== "ml") {
    return sendError(response, 400, "VALIDATION_ERROR", "Only Malayalam translation is currently supported.");
  }

  const query = await queriesRepository.findById(queryId);
  if (!query) {
    return sendError(response, 404, "NOT_FOUND", "Query not found.");
  }

  if (!isAllowedToView(request.authUser.uid, request.authUser.role, query.userId)) {
    return sendError(response, 403, "FORBIDDEN", "You do not have access to this query.");
  }

  const responses = await responsesRepository.listByQueryId(queryId);
  const latestResponse = responses[responses.length - 1];

  if (!latestResponse?.content?.trim()) {
    return sendError(response, 400, "VALIDATION_ERROR", "No response is available to translate.");
  }

  const translated = await translateAdvisory({
    content: latestResponse.content,
    targetLanguage
  });

  return sendSuccess(response, {
    responseId: latestResponse.responseId,
    sourceLanguage: "en",
    targetLanguage,
    originalContent: latestResponse.content,
    translatedContent: translated.content,
    translatedBy: translated.modelUsed,
    source: translated.source
  });
}
