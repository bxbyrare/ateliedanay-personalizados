import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { toPublicUser } from "../../lib/serializers.js";
import { setAccessCookie, setRefreshCookie, clearAuthCookies, REFRESH_COOKIE } from "../../lib/cookies.js";
import { UnauthorizedError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { isProduction } from "../../config/env.js";
import * as authService from "./service.js";
import { prisma } from "../../lib/prisma.js";
import type {
  RegisterInput,
  LoginInput,
  PasswordResetRequestInput,
  PasswordResetConfirmInput,
  ChangePasswordInput,
  GoogleAuthInput,
} from "@ateliedanay/shared";

function requestMeta(req: Request) {
  return { ip: req.ip, userAgent: req.get("user-agent") ?? undefined };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const user = await authService.registerUser(input);
  const tokens = await authService.issueTokenPair(user.id, user.role, false, requestMeta(req));

  setAccessCookie(res, tokens.accessToken);
  setRefreshCookie(res, tokens.refreshToken, false);

  res.status(201).json({ user: toPublicUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const { user, accessToken, refreshToken, rememberMe } = await authService.loginUser(input, requestMeta(req));

  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken, rememberMe);

  res.status(200).json({ user: toPublicUser(user) });
});

export const google = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as GoogleAuthInput;
  const { user, accessToken, refreshToken, rememberMe } = await authService.loginWithGoogle(
    input.credential,
    requestMeta(req),
  );

  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken, rememberMe);

  res.status(200).json({ user: toPublicUser(user) });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!rawToken) {
    throw new UnauthorizedError();
  }

  const { user, accessToken, refreshToken, rememberMe } = await authService.rotateRefreshToken(
    rawToken,
    requestMeta(req),
  );

  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken, rememberMe);

  res.status(200).json({ user: toPublicUser(user) });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (rawToken) {
    await authService.revokeRefreshToken(rawToken);
  }
  clearAuthCookies(res);
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) {
    throw new UnauthorizedError();
  }
  res.status(200).json({ user: toPublicUser(user) });
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as PasswordResetRequestInput;
  const rawToken = await authService.requestPasswordReset(input.email);

  if (rawToken && !isProduction) {
    // Dev-only convenience: no email provider is wired up yet (flagged in the project plan).
    logger.info({ email: input.email, rawToken }, "[DEV ONLY] Password reset token generated");
  }

  // Always the same response, whether or not the account exists — prevents enumeration.
  res.status(200).json({ message: "Se o e-mail existir, enviaremos instruções de redefinição." });
});

export const confirmPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as PasswordResetConfirmInput;
  await authService.confirmPasswordReset(input.token, input.password);
  res.status(200).json({ message: "Senha redefinida com sucesso." });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const input = req.body as ChangePasswordInput;
  await authService.changePassword(req.user.sub, input);
  res.status(200).json({ message: "Senha atualizada com sucesso." });
});
