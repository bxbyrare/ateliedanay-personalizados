import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { doubleCsrfProtection } from "../../middleware/csrf.js";
import { readAuthedRateLimit, writeModerateRateLimit } from "../../middleware/rateLimit.js";
import { addressSchema } from "@ateliedanay/shared";
import * as controller from "./controller.js";

export const addressesRouter = Router();

addressesRouter.use(requireAuth);

addressesRouter.get("/", readAuthedRateLimit, controller.list);
addressesRouter.post(
  "/",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ body: addressSchema }),
  controller.create,
);
addressesRouter.put(
  "/:id",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ params: controller.idParamSchema, body: addressSchema }),
  controller.update,
);
addressesRouter.delete(
  "/:id",
  doubleCsrfProtection,
  writeModerateRateLimit,
  validate({ params: controller.idParamSchema }),
  controller.remove,
);
