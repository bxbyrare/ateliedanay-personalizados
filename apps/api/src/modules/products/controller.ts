import type { Request, Response } from "express";
import sanitizeHtml from "sanitize-html";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../lib/errors.js";
import { uniqueSlugFor } from "../../lib/slug.js";
import type { ProductListQuery, CreateProductInput, UpdateProductInput } from "@ateliedanay/shared";

function productSlugExists(excludeId?: string) {
  return (candidate: string) =>
    prisma.product
      .findFirst({ where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) } })
      .then((existing) => existing !== null);
}

// Description is admin-authored rich-ish text rendered back to shoppers — sanitize even
// though only admins can write it, as defense-in-depth against a compromised admin
// session or a future less-trusted content source.
function sanitizeDescription(description: string | undefined): string | null {
  if (!description) return null;
  return sanitizeHtml(description, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    allowedAttributes: {},
  });
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ProductListQuery;

  const where = {
    isActive: true,
    ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  res.status(200).json({
    products,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as unknown as { slug: string };
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      customizationFields: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) throw new NotFoundError("Produto não encontrado");
  res.status(200).json({ product });
});

// --- Admin-only management below (requireRole("admin") is enforced at the route level) ---

export const adminList = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ProductListQuery;
  const [total, products] = await Promise.all([
    prisma.product.count({}),
    prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);
  res.status(200).json({
    products,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  });
});

export const adminGetById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      customizationFields: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) throw new NotFoundError("Produto não encontrado");
  res.status(200).json({ product });
});

export const adminCreate = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateProductInput;
  const slug = await uniqueSlugFor(input.name, productSlugExists());

  const product = await prisma.product.create({
    data: {
      slug,
      name: input.name,
      description: sanitizeDescription(input.description),
      priceCents: input.price,
      categoryId: input.categoryId || null,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      stockQuantity: input.stockQuantity ?? null,
      sku: input.sku || null,
      videoUrl: input.videoUrl || null,
      images: {
        create: input.images.map((img, index) => ({
          url: img.url,
          altText: img.altText || null,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder ?? index,
        })),
      },
      customizationFields: {
        create: input.customizationFields.map((field, index) => ({
          label: field.label,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          maxLength: field.maxLength,
          options: field.options && field.options.length > 0 ? field.options : undefined,
          helpText: field.helpText || null,
          sortOrder: field.sortOrder ?? index,
        })),
      },
    },
    include: { images: true, category: true, customizationFields: true },
  });

  res.status(201).json({ product });
});

export const adminUpdate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const input = req.body as UpdateProductInput;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Produto não encontrado");

  const slug =
    input.name && input.name !== existing.name ? await uniqueSlugFor(input.name, productSlugExists(id)) : undefined;

  const product = await prisma.$transaction(async (tx) => {
    if (input.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: input.images.map((img, index) => ({
          productId: id,
          url: img.url,
          altText: img.altText || null,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder ?? index,
        })),
      });
    }

    if (input.customizationFields) {
      // Re-created wholesale rather than diffed — existing cart/order line items keep
      // their own customizationValues snapshot, so this never rewrites past orders.
      await tx.productCustomizationField.deleteMany({ where: { productId: id } });
      await tx.productCustomizationField.createMany({
        data: input.customizationFields.map((field, index) => ({
          productId: id,
          label: field.label,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          maxLength: field.maxLength,
          options: field.options && field.options.length > 0 ? field.options : undefined,
          helpText: field.helpText || null,
          sortOrder: field.sortOrder ?? index,
        })),
      });
    }

    return tx.product.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(slug ? { slug } : {}),
        ...(input.description !== undefined ? { description: sanitizeDescription(input.description) } : {}),
        ...(input.price !== undefined ? { priceCents: input.price } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId || null } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
        ...(input.stockQuantity !== undefined ? { stockQuantity: input.stockQuantity } : {}),
        ...(input.sku !== undefined ? { sku: input.sku || null } : {}),
        ...(input.videoUrl !== undefined ? { videoUrl: input.videoUrl || null } : {}),
      },
      include: { images: true, category: true, customizationFields: true },
    });
  });

  res.status(200).json({ product });
});

// Soft delete only — hard-deleting would orphan historical OrderItem references.
export const adminDeactivate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Produto não encontrado");
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  res.status(204).send();
});
