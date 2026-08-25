import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { doubleCsrfProtection } from "../../middleware/csrf.js";
import { authStrictIpRateLimit, authStrictAccountRateLimit, readAuthedRateLimit } from "../../middleware/rateLimit.js";
import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  changePasswordSchema,
  googleAuthSchema,
} from "@ateliedanay/shared";
import * as controller from "./controller.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  authStrictIpRateLimit,
  validate({ body: registerSchema }),
  authStrictAccountRateLimit,
  controller.register,
);

authRouter.post(
  "/login",
  authStrictIpRateLimit,
  validate({ body: loginSchema }),
  authStrictAccountRateLimit,
  controller.login,
);

authRouter.post(
  "/google",
  authStrictIpRateLimit,
  validate({ body: googleAuthSchema }),
  controller.google,
);

// Refresh/logout are not behind requireAuth (the access token may already be expired —
// that's the whole point of refresh) but they are still CSRF-protected mutations.
authRouter.post("/refresh", doubleCsrfProtection, controller.refresh);
authRouter.post("/logout", doubleCsrfProtection, controller.logout);

authRouter.get("/me", requireAuth, readAuthedRateLimit, controller.me);

authRouter.post(
  "/password-reset/request",
  authStrictIpRateLimit,
  validate({ body: passwordResetRequestSchema }),
  authStrictAccountRateLimit,
  controller.requestPasswordReset,
);

authRouter.post(
  "/password-reset/confirm",
  authStrictIpRateLimit,
  validate({ body: passwordResetConfirmSchema }),
  controller.confirmPasswordReset,
);

authRouter.post(
  "/change-password",
  requireAuth,
  doubleCsrfProtection,
  validate({ body: changePasswordSchema }),
  controller.changePassword,
);
