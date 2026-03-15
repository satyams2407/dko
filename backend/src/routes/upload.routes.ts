import multer from "multer";
import { Router } from "express";
import { uploadAudio, uploadImage } from "../controllers/upload.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendError } from "../utils/http.js";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadRouter = Router();

uploadRouter.use(authenticateToken);

uploadRouter.post(
  "/audio",
  upload.single("file"),
  (request, response, next) => {
    if (request.file && request.file.size > 10 * 1024 * 1024) {
      return sendError(response, 413, "PAYLOAD_TOO_LARGE", "Audio file exceeds 10 MB.");
    }

    return next();
  },
  asyncHandler(uploadAudio)
);

uploadRouter.post(
  "/image",
  upload.single("file"),
  (request, response, next) => {
    if (request.file && request.file.size > 5 * 1024 * 1024) {
      return sendError(response, 413, "PAYLOAD_TOO_LARGE", "Image file exceeds 5 MB.");
    }

    return next();
  },
  asyncHandler(uploadImage)
);
