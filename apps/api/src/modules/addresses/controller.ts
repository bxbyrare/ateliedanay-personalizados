import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError, UnauthorizedError } from "../../lib/errors.js";
import type { AddressInput } from "@ateliedanay/shared";

export const idParamSchema = z.object({ id: z.string().uuid() });

function requireUserId(req: Request): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  res.status(200).json({ addresses });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const input = req.body as AddressInput;

  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.create({ data: { ...input, userId } });
  });

  res.status(201).json({ address });
});

async function getOwnedAddress(userId: string, id: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) {
    // 404, not 403 — never confirm to a caller that another user's address id exists.
    throw new NotFoundError("Endereço não encontrado");
  }
  return address;
}

export const update = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { id } = req.params as unknown as { id: string };
  await getOwnedAddress(userId, id);
  const input = req.body as AddressInput;

  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.update({ where: { id }, data: input });
  });

  res.status(200).json({ address });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { id } = req.params as unknown as { id: string };
  await getOwnedAddress(userId, id);
  await prisma.address.delete({ where: { id } });
  res.status(204).send();
});
