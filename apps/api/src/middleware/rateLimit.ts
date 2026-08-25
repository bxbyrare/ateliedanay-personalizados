import type { NextFunction, Request, Response } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { TooManyRequestsError } from "../lib/errors.js";

// In-memory store — fine for a single Node process on the VPS. If the app is ever
// scaled to multiple instances, swap RateLimiterMemory for RateLimiterRedis (same API).

function requestIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function buildLimiterMiddleware(
  limiter: RateLimiterMemory,
  keyFn: (req: Request) => string,
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await limiter.consume(keyFn(req));
      next();
    } catch (rejection) {
      const msBeforeNext = typeof rejection === "object" && rejection !== null && "msBeforeNext" in rejection
        ? Number((rejection as { msBeforeNext: number }).msBeforeNext)
        : 1000;
      res.setHeader("Retry-After", String(Math.ceil(msBeforeNext / 1000)));
      next(new TooManyRequestsError());
    }
  };
}

// Every route in the app gets at least this baseline limit, applied globally in app.ts.
const globalLimiter = new RateLimiterMemory({ points: 300, duration: 60 });
export const globalRateLimit = buildLimiterMiddleware(globalLimiter, requestIp);

// Public catalog reads — generous but bounded per IP.
const readPublicLimiter = new RateLimiterMemory({ points: 200, duration: 60 });
export const readPublicRateLimit = buildLimiterMiddleware(readPublicLimiter, requestIp);

// Authenticated reads (account, orders, addresses) — per user.
const readAuthedLimiter = new RateLimiterMemory({ points: 150, duration: 60 });
export const readAuthedRateLimit = buildLimiterMiddleware(
  readAuthedLimiter,
  (req) => req.user?.sub ?? requestIp(req),
);

// Authenticated mutations (cart/address/wishlist writes) — per user.
const writeModerateLimiter = new RateLimiterMemory({ points: 40, duration: 60 });
export const writeModerateRateLimit = buildLimiterMiddleware(
  writeModerateLimiter,
  (req) => req.user?.sub ?? requestIp(req),
);

// Checkout / order creation — deliberately tight, per user.
const checkoutLimiter = new RateLimiterMemory({ points: 10, duration: 60 });
export const checkoutRateLimit = buildLimiterMiddleware(
  checkoutLimiter,
  (req) => req.user?.sub ?? requestIp(req),
);

// Admin file uploads (product photos/video) — per user, deliberately tight since each
// request can carry a large payload.
const uploadLimiter = new RateLimiterMemory({ points: 20, duration: 60 });
export const uploadRateLimit = buildLimiterMiddleware(uploadLimiter, (req) => req.user?.sub ?? requestIp(req));

// Auth-sensitive endpoints (register/login/password-reset) — tight per-IP window,
// PLUS a per-account window below so an attacker rotating IPs still can't brute-force
// one specific account into the ground.
const authStrictIpLimiter = new RateLimiterMemory({ points: 8, duration: 15 * 60 });
export const authStrictIpRateLimit = buildLimiterMiddleware(authStrictIpLimiter, requestIp);

const authStrictAccountLimiter = new RateLimiterMemory({ points: 8, duration: 15 * 60 });
export const authStrictAccountRateLimit = buildLimiterMiddleware(authStrictAccountLimiter, (req) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  return email || requestIp(req);
});
