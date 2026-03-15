import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@dko/shared";
import { adminAuth } from "../config/firebase.js";
import { usersRepository } from "../repositories/users.repository.js";
import { sendError } from "../utils/http.js";

function getBearerToken(request: Request) {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

export async function authenticateToken(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return sendError(response, 401, "UNAUTHORIZED", "Missing bearer token.");
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const user = await usersRepository.upsertFromDecodedToken(decoded, {});

    if (user.isActive === false) {
      return sendError(response, 403, "USER_INACTIVE", "User account is inactive.");
    }

    request.authUser = {
      uid: decoded.uid,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    return next();
  } catch (error) {
    console.error("Token verification failed", error);
    return sendError(response, 401, "UNAUTHORIZED", "Invalid or expired token.");
  }
}

export function requireRole(...roles: UserRole[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.authUser) {
      return sendError(response, 401, "UNAUTHORIZED", "Authentication required.");
    }

    if (!roles.includes(request.authUser.role)) {
      return sendError(response, 403, "FORBIDDEN", "You do not have access to this resource.");
    }

    return next();
  };
}
