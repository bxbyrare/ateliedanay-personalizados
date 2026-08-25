import { Router } from "express";
import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { readPublicRateLimit } from "../../middleware/rateLimit.js";
import { logger } from "../../lib/logger.js";

export const paymentsRouter = Router();

// Stub webhook endpoint — no real gateway wired up yet. Kept behind a rate limit even
// though it's a placeholder, and does not trust the payload for anything yet.
paymentsRouter.post(
  "/webhook",
  readPublicRateLimit,
  asyncHandler(async (req: Request, res: Response) => {
    logger.info({ headers: req.headers["x-signature"] }, "Payment webhook received (no provider configured yet)");
    res.status(200).json({ received: true });
  }),
);
