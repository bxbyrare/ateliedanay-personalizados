import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { doubleCsrfProtection } from "../../middleware/csrf.js";
import { readPublicRateLimit, readAuthedRateLimit, writeModerateRateLimit } from "../../middleware/rateLimit.js";
import { slugParamSchema, categorySchema, updateCategorySchema, categoryIdParamSchema } from "@ateliedanay/shared";
import * as controller from "./controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", readPublicRateLimit, controller.list);

// Admin management — mounted before the public "/:slug" route so "/admin" doesn't get
// swallowed by the slug matcher.
categoriesRouter.get(
  "/admin/all",
  requireAuth,
  requireRole("admin"),
  readAuthedRateLimit,
  controller.adminList,
);
categoriesRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ body: categorySchema }),
  controller.adminCreate,
);
categoriesRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  controller.adminUpdate,
);

categoriesRouter.get("/:slug", readPublicRateLimit, validate({ params: slugParamSchema }), controller.getBySlug);
