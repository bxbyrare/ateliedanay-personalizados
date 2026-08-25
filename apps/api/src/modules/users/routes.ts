import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { doubleCsrfProtection } from "../../middleware/csrf.js";
import { readAuthedRateLimit, writeModerateRateLimit } from "../../middleware/rateLimit.js";
import { updateProfileSchema } from "@ateliedanay/shared";
import * as controller from "./controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/me", readAuthedRateLimit, controller.getMe);
usersRouter.patch(
  "/me",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ body: updateProfileSchema }),
  controller.updateMe,
);
