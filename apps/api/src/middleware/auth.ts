import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { ACCESS_COOKIE } from "../lib/cookies.js";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";
import type { UserRole } from "@ateliedanay/shared";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_COOKIE] as string | undefined;
  if (!token) {
    next(new UnauthorizedError());
    return;
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    next(new UnauthorizedError());
    return;
  }
  req.user = payload;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError());
      return;
    }
    next();
  };
}
