import type { Request, Response } from "express";
import { adminAuth } from "../config/firebase.js";
import { usersRepository } from "../repositories/users.repository.js";
import { sendError, sendSuccess } from "../utils/http.js";

export async function verifyAuthSession(request: Request, response: Response) {
  const { idToken, name, language, region } = request.body as {
    idToken?: string;
    name?: string;
    language?: "en" | "hi" | "pa";
    region?: string;
  };

  if (!idToken) {
    return sendError(response, 400, "VALIDATION_ERROR", "idToken is required.");
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const user = await usersRepository.upsertFromDecodedToken(decoded, {
      name,
      language,
      region
    });

    return sendSuccess(response, { user });
  } catch (error) {
    console.error("Failed to verify auth session", error);
    return sendError(response, 401, "INVALID_TOKEN", "Unable to verify Firebase token.");
  }
}
