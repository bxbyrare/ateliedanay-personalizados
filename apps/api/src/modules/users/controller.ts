import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { toPublicUser } from "../../lib/serializers.js";
import { prisma } from "../../lib/prisma.js";
import { ConflictError, UnauthorizedError } from "../../lib/errors.js";
import type { UpdateProfileInput } from "@ateliedanay/shared";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.sub } });
  res.status(200).json({ user: toPublicUser(user) });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const input = req.body as UpdateProfileInput;

  if (input.cpf) {
    const existing = await prisma.user.findUnique({ where: { cpf: input.cpf } });
    if (existing && existing.id !== req.user.sub) {
      throw new ConflictError("Este CPF já está cadastrado em outra conta");
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user.sub },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.cpf !== undefined ? { cpf: input.cpf || null } : {}),
    },
  });
  res.status(200).json({ user: toPublicUser(user) });
});
