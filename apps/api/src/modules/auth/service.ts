import { randomBytes } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { generateOpaqueToken, hashOpaqueToken } from "../../lib/tokens.js";
import { signAccessToken } from "../../lib/jwt.js";
import { refreshTokenExpiry } from "../../lib/cookies.js";
import { env } from "../../config/env.js";
import { AppError, UnauthorizedError, ConflictError } from "../../lib/errors.js";
import type { RegisterInput, LoginInput, ChangePasswordInput } from "@ateliedanay/shared";

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

const GENERIC_LOGIN_ERROR = "E-mail ou senha inválidos";

interface RequestMeta {
  ip: string | undefined;
  userAgent: string | undefined;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    // Deliberately vague — don't confirm which field collided, to reduce enumeration value,
    // though registration inherently reveals existence via this exact conflict response.
    throw new ConflictError("Não foi possível concluir o cadastro com os dados informados");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name: input.name, email: input.email, passwordHash },
    });
    await tx.cart.create({ data: { userId: created.id } });
    return created;
  });

  return user;
}

async function recordLoginAttempt(email: string, success: boolean, meta: RequestMeta) {
  await prisma.loginAttempt.create({
    data: { emailAttempted: email, success, ipAddress: meta.ip, userAgent: meta.userAgent },
  });
}

export async function loginUser(input: LoginInput, meta: RequestMeta) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !user.isActive) {
    await recordLoginAttempt(input.email, false, meta);
    throw new UnauthorizedError(GENERIC_LOGIN_ERROR);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await recordLoginAttempt(input.email, false, meta);
    throw new AppError(429, "Conta temporariamente bloqueada por excesso de tentativas. Tente novamente mais tarde.");
  }

  const validPassword = await verifyPassword(user.passwordHash, input.password);

  if (!validPassword) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= env.LOGIN_MAX_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + env.LOGIN_LOCKOUT_MINUTES * 60 * 1000) : null,
      },
    });
    await recordLoginAttempt(input.email, false, meta);
    throw new UnauthorizedError(GENERIC_LOGIN_ERROR);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  await recordLoginAttempt(input.email, true, meta);

  const tokens = await issueTokenPair(user.id, user.role, input.rememberMe, meta);
  return { user, ...tokens };
}

export async function issueTokenPair(
  userId: string,
  role: "customer" | "admin",
  rememberMe: boolean,
  meta: RequestMeta,
) {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshTokenRaw = generateOpaqueToken();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashOpaqueToken(refreshTokenRaw),
      expiresAt: refreshTokenExpiry(rememberMe),
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    },
  });

  return { accessToken, refreshToken: refreshTokenRaw, rememberMe };
}

export async function rotateRefreshToken(rawToken: string, meta: RequestMeta) {
  const tokenHash = hashOpaqueToken(rawToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!existing) {
    throw new UnauthorizedError();
  }

  if (existing.revokedAt) {
    // Reuse of an already-rotated/revoked token — likely theft. Nuke every session for
    // this user and force a full re-login.
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new UnauthorizedError();
  }

  if (existing.expiresAt < new Date()) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findUnique({ where: { id: existing.userId } });
  if (!user || !user.isActive) {
    throw new UnauthorizedError();
  }

  // Preserve the original "remember me" duration by re-deriving it from this token's
  // own lifetime rather than trusting new client input.
  const originalDurationMs = existing.expiresAt.getTime() - existing.createdAt.getTime();
  const rememberMe = originalDurationMs > env.REFRESH_TOKEN_TTL_DAYS_SESSION * 24 * 60 * 60 * 1000;

  const next = await issueTokenPair(user.id, user.role, rememberMe, meta);

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date(), replacedByTokenId: hashOpaqueToken(next.refreshToken) },
  });

  return { user, ...next };
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const tokenHash = hashOpaqueToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function requestPasswordReset(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null; // caller always returns a generic success response regardless
  }

  const rawToken = generateOpaqueToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashOpaqueToken(rawToken),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  return rawToken;
}

export async function confirmPasswordReset(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = hashOpaqueToken(rawToken);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new AppError(400, "Link de redefinição inválido ou expirado");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({ where: { userId: resetToken.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
}

// Only the email and name Google reports are used — no other Google account data is
// requested or read (the OAuth scope on the frontend is limited to "openid email profile").
export async function loginWithGoogle(credential: string, meta: RequestMeta) {
  if (!googleClient) {
    throw new AppError(503, "Login com Google não está configurado neste ambiente");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw new UnauthorizedError("Não foi possível verificar sua conta Google");
  }

  if (!payload?.email || !payload.email_verified) {
    throw new UnauthorizedError("Sua conta Google precisa de um e-mail verificado");
  }

  const email = payload.email.toLowerCase();
  const name = payload.name?.trim() || email.split("@")[0];

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Random, never-disclosed password hash — this account can only ever be accessed
    // via Google sign-in (or the "forgot password" flow, which issues a fresh one).
    const passwordHash = await hashPassword(randomBytes(32).toString("hex"));
    user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { name, email, passwordHash, emailVerifiedAt: new Date() } });
      await tx.cart.create({ data: { userId: created.id } });
      return created;
    });
  } else if (!user.isActive) {
    throw new UnauthorizedError(GENERIC_LOGIN_ERROR);
  }

  await recordLoginAttempt(email, true, meta);
  const tokens = await issueTokenPair(user.id, user.role, true, meta);
  return { user, ...tokens };
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await verifyPassword(user.passwordHash, input.currentPassword);
  if (!valid) {
    throw new AppError(400, "Senha atual incorreta");
  }
  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
