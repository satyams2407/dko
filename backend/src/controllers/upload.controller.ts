import type { Request, Response } from "express";
import { uploadBufferToStorage } from "../services/storage.service.js";
import { sendError, sendSuccess } from "../utils/http.js";

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType === "audio/webm") return "webm";
  if (mimeType === "audio/mp4" || mimeType === "audio/mpeg") return "mp4";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export async function uploadAudio(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  if (!request.file) {
    return sendError(response, 400, "VALIDATION_ERROR", "Audio file is required.");
  }

  if (!["audio/webm", "audio/mp4", "audio/mpeg"].includes(request.file.mimetype)) {
    return sendError(response, 415, "UNSUPPORTED_MEDIA_TYPE", "Audio must be WebM, MP4, or MPEG.");
  }

  const upload = await uploadBufferToStorage({
    folder: "audio",
    userId: request.authUser.uid,
    extension: getExtensionFromMimeType(request.file.mimetype),
    mimeType: request.file.mimetype,
    buffer: request.file.buffer,
    fileNamePrefix: "voice"
  });

  return sendSuccess(response, { ...upload, mimeType: request.file.mimetype }, 201);
}

export async function uploadImage(request: Request, response: Response) {
  if (!request.authUser) {
    return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
  }

  if (!request.file) {
    return sendError(response, 400, "VALIDATION_ERROR", "Image file is required.");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(request.file.mimetype)) {
    return sendError(response, 415, "UNSUPPORTED_MEDIA_TYPE", "Image must be JPEG, PNG, or WebP.");
  }

  const upload = await uploadBufferToStorage({
    folder: "images",
    userId: request.authUser.uid,
    extension: getExtensionFromMimeType(request.file.mimetype),
    mimeType: request.file.mimetype,
    buffer: request.file.buffer,
    fileNamePrefix: "image"
  });

  return sendSuccess(response, { ...upload, mimeType: request.file.mimetype }, 201);
}
