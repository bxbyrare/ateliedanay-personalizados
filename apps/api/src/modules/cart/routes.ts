import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { doubleCsrfProtection } from "../../middleware/csrf.js";
import { readAuthedRateLimit, writeModerateRateLimit } from "../../middleware/rateLimit.js";
import { addCartItemSchema, updateCartItemSchema, cartItemIdParamSchema } from "@ateliedanay/shared";
import * as controller from "./controller.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", readAuthedRateLimit, controller.getCart);

cartRouter.post(
  "/items",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ body: addCartItemSchema }),
  controller.addItem,
);

cartRouter.patch(
  "/items/:itemId",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ params: cartItemIdParamSchema, body: updateCartItemSchema }),
  controller.updateItem,
);

cartRouter.delete(
  "/items/:itemId",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ params: cartItemIdParamSchema }),
  controller.removeItem,
);

cartRouter.post(
  "/merge",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ body: controller.mergeCartSchema }),
  controller.mergeCart,
);
