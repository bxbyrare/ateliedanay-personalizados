import type { Response } from "express";
import { env, isProduction } from "../config/env.js";

export const ACCESS_COOKIE = "ad_access";
export const REFRESH_COOKIE = "ad_refresh";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/",
};

export function setAccessCookie(res: Response, token: string): void {
  res.cookie(ACCESS_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * 60 * 1000,
  });
}

export function setRefreshCookie(res: Response, token: string, rememberMe: boolean): void {
  const days = rememberMe ? env.REFRESH_TOKEN_TTL_DAYS_REMEMBERED : env.REFRESH_TOKEN_TTL_DAYS_SESSION;
  res.cookie(REFRESH_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: days * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, baseCookieOptions);
  res.clearCookie(REFRESH_COOKIE, baseCookieOptions);
}

export function refreshTokenExpiry(rememberMe: boolean): Date {
  const days = rememberMe ? env.REFRESH_TOKEN_TTL_DAYS_REMEMBERED : env.REFRESH_TOKEN_TTL_DAYS_SESSION;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
