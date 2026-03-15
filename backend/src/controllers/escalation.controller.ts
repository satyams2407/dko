import type { Request, Response } from "express";
import { escalationsRepository } from "../repositories/escalations.repository.js";
import { notificationsRepository } from "../repositories/notifications.repository.js";
import { queriesRepository } from "../repositories/queries.repository.js";
import { responsesRepository } from "../repositories/responses.repository.js";
import { usersRepository } from "../repositories/users.repository.js";
import { sendError, sendSuccess } from "../utils/http.js";

export async function listEscalations(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const status = typeof request.query.status === "string" ? request.query.status : "all";
  if (!["all", "pending", "in_progress", "resolved"].includes(status)) {
    return sendError(response, 400, "VALIDATION_ERROR", "Invalid escalation status filter.");
  }

  const escalations = await escalationsRepository.list(status as "all" | "pending" | "in_progress" | "resolved");
  return sendSuccess(response, { items: escalations });
}

export async function getEscalationById(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const escalationId = request.params.id;
  if (typeof escalationId !== "string") {
    return sendError(response, 400, "VALIDATION_ERROR", "Escalation ID is required.");
  }

  const escalation = await escalationsRepository.findById(escalationId);
  if (!escalation) {
    return sendError(response, 404, "NOT_FOUND", "Escalation not found.");
  }

  const query = await queriesRepository.findById(escalation.queryId);
  const responses = await responsesRepository.listByQueryId(escalation.queryId);
  const farmer = await usersRepository.findById(escalation.userId);

  return sendSuccess(response, {
    escalation,
    query,
    responses,
    farmer
  });
}

export async function assignEscalation(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const escalationId = request.params.id;
  if (typeof escalationId !== "string") {
    return sendError(response, 400, "VALIDATION_ERROR", "Escalation ID is required.");
  }

  const existing = await escalationsRepository.findById(escalationId);
  if (!existing) {
    return sendError(response, 404, "NOT_FOUND", "Escalation not found.");
  }

  if (existing.assignedTo && existing.assignedTo !== request.authUser.uid && existing.status !== "resolved") {
    return sendError(response, 409, "ALREADY_ASSIGNED", "This escalation is already assigned to another officer.");
  }

  const escalation = await escalationsRepository.assign(escalationId, {
    officerId: request.authUser.uid,
    officerName: request.authUser.name
  });

  return sendSuccess(response, { escalation });
}

export async function respondToEscalation(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  const escalationId = request.params.id;
  const { content } = request.body as { content?: string };

  if (typeof escalationId !== "string") {
    return sendError(response, 400, "VALIDATION_ERROR", "Escalation ID is required.");
  }

  if (!content?.trim()) {
    return sendError(response, 400, "VALIDATION_ERROR", "Officer response content is required.");
  }

  const escalation = await escalationsRepository.findById(escalationId);
  if (!escalation) {
    return sendError(response, 404, "NOT_FOUND", "Escalation not found.");
  }

  const officerResponse = await responsesRepository.createOfficerResponse({
    queryId: escalation.queryId,
    content: content.trim(),
    officerId: request.authUser.uid,
    officerName: request.authUser.name
  });

  await escalationsRepository.resolve(escalationId, {
    responseId: officerResponse.responseId,
    officerId: request.authUser.uid,
    officerName: request.authUser.name
  });

  const query = await queriesRepository.markResolved(escalation.queryId, content.trim());
  await notificationsRepository.create({
    userId: escalation.userId,
    type: "officer_response",
    title: "Officer response received",
    message: "An agricultural officer has responded to your query. Open the conversation to review the advice.",
    queryId: escalation.queryId,
    escalationId: escalation.escalationId
  });

  return sendSuccess(response, {
    response: officerResponse,
    query
  }, 201);
}
