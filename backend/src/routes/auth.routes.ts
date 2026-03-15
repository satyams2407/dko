import { Router } from "express";
import { verifyAuthSession } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const authRouter = Router();

authRouter.post("/verify", asyncHandler(verifyAuthSession));
