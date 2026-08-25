import { doubleCsrf } from "csrf-csrf";
import type { Request } from "express";
import { env, isProduction } from "../config/env.js";

// Double-submit-cookie CSRF protection. Required because auth relies on cookies
export const { generateToken: generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  cookieName: isProduction ? "__Host-ad.csrf" : "ad.csrf",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  },
  getSessionIdentifier: (req: Request) => req.cookies?.ad_access ?? req.ip ?? "anonymous",
  getTokenFromRequest: (req: Request) => req.headers["x-csrf-token"] as string | undefined,
});
