import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../lib/errors.js";
import { uniqueSlugFor } from "../../lib/slug.js";
import type { CategoryInput, UpdateCategoryInput } from "@ateliedanay/shared";

function categorySlugExists(excludeId?: string) {
  return (candidate: string) =>
    prisma.category
      .findFirst({ where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) } })
      .then((existing) => existing !== null);
}

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  res.status(200).json({ categories });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as unknown as { slug: string };
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  if (!category) throw new NotFoundError("Categoria não encontrada");
  res.status(200).json({ category });
});

// --- Admin-only management below (requireRole("admin") is enforced at the route level) ---

export const adminList = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  res.status(200).json({ categories });
});

export const adminCreate = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CategoryInput;
  const slug = await uniqueSlugFor(input.name, categorySlugExists());

  const category = await prisma.category.create({
    data: {
      slug,
      name: input.name,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
  });

  res.status(201).json({ category });
});

export const adminUpdate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const input = req.body as UpdateCategoryInput;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Categoria não encontrada");

  const slug =
    input.name && input.name !== existing.name ? await uniqueSlugFor(input.name, categorySlugExists(id)) : undefined;

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(slug ? { slug } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl || null } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });

  res.status(200).json({ category });
});
