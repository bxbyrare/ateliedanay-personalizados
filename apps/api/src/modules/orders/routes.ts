import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { doubleCsrfProtection } from "../../middleware/csrf.js";
import { readAuthedRateLimit, checkoutRateLimit } from "../../middleware/rateLimit.js";
import { createOrderSchema, orderListQuerySchema } from "@ateliedanay/shared";
import * as controller from "./controller.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

const idParamSchema = z.object({ id: z.string().uuid() });

ordersRouter.post(
  "/",
  doubleCsrfProtection,
  checkoutRateLimit,
  validate({ body: createOrderSchema }),
  controller.create,
);
ordersRouter.get("/", readAuthedRateLimit, validate({ query: orderListQuerySchema }), controller.list);
ordersRouter.get("/:id", readAuthedRateLimit, validate({ params: idParamSchema }), controller.getById);
