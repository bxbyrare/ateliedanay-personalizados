import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { prisma } from "../../lib/prisma.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../lib/errors.js";
import type { AddWishlistItemInput } from "@ateliedanay/shared";

function requireUserId(req: Request): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { images: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ items });
});

export const add = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { productId } = req.body as AddWishlistItemInput;

  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } });
  if (!product) throw new NotFoundError("Produto não encontrado");

  const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) throw new ConflictError("Produto já está nos favoritos");

  const item = await prisma.wishlistItem.create({ data: { userId, productId } });
  res.status(201).json({ item });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { productId } = req.params as unknown as { productId: string };
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  res.status(204).send();
});
