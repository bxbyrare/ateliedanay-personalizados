import { randomBytes, createHash } from "node:crypto";

// Opaque tokens (refresh tokens, password-reset tokens): random bytes handed to the
// client, only the SHA-256 hash is ever persisted — a DB leak never yields a usable token.
export function generateOpaqueToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
