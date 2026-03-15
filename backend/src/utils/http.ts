import type { Response } from "express";

export function sendSuccess<T>(response: Response, data: T, status = 200) {
  return response.status(status).json({
    success: true,
    data
  });
}

export function sendError(
  response: Response,
  status: number,
  code: string,
  message: string
) {
  return response.status(status).json({
    success: false,
    error: {
      code,
      message
    }
  });
}
