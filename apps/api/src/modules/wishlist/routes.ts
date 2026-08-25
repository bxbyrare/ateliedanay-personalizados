import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { doubleCsrfProtection } from "../../middleware/csrf.js";
import { readAuthedRateLimit, writeModerateRateLimit } from "../../middleware/rateLimit.js";
import { addWishlistItemSchema } from "@ateliedanay/shared";
import * as controller from "./controller.js";

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

const productIdParamSchema = z.object({ productId: z.string().uuid() });

wishlistRouter.get("/", readAuthedRateLimit, controller.list);
wishlistRouter.post(
  "/",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ body: addWishlistItemSchema }),
  controller.add,
);
wishlistRouter.delete(
  "/:productId",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ params: productIdParamSchema }),
  controller.remove,
);
