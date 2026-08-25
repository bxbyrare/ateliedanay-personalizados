import type { User } from "@prisma/client";
import type { PublicUser } from "@ateliedanay/shared";

// Never send passwordHash, failedLoginAttempts, lockedUntil etc. to the client.
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    cpf: user.cpf,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}
