import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { doubleCsrfProtection } from "../../middleware/csrf.js";
import { uploadRateLimit } from "../../middleware/rateLimit.js";
import { uploadMiddleware, handleUpload } from "./controller.js";

export const uploadsRouter = Router();

uploadsRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  doubleCsrfProtection,
  uploadRateLimit,
  uploadMiddleware,
  handleUpload,
);
