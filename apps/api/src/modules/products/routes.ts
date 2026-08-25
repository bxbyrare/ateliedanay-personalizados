import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { doubleCsrfProtection } from "../../middleware/csrf.js";
import { readPublicRateLimit, readAuthedRateLimit, writeModerateRateLimit } from "../../middleware/rateLimit.js";
import {
  productListQuerySchema,
  slugParamSchema,
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
} from "@ateliedanay/shared";
import * as controller from "./controller.js";

export const productsRouter = Router();

// Public catalog reads.
productsRouter.get("/", readPublicRateLimit, validate({ query: productListQuerySchema }), controller.list);

// Admin management — mounted before the public "/:slug" route so "/admin" doesn't get
// swallowed by the slug matcher.
productsRouter.get(
  "/admin/all",
  requireAuth,
  requireRole("admin"),
  readAuthedRateLimit,
  validate({ query: productListQuerySchema }),
  controller.adminList,
);
productsRouter.get(
  "/admin/:id",
  requireAuth,
  requireRole("admin"),
  readAuthedRateLimit,
  validate({ params: productIdParamSchema }),
  controller.adminGetById,
);
productsRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ body: createProductSchema }),
  controller.adminCreate,
);
productsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  controller.adminUpdate,
);
productsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ params: productIdParamSchema }),
  controller.adminDeactivate,
);

productsRouter.get("/:slug", readPublicRateLimit, validate({ params: slugParamSchema }), controller.getBySlug);
