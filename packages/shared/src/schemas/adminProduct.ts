import { z } from "zod";
import { customizationFieldDefinitionSchema } from "./product.js";

const priceInReaisToCents = z.coerce
  .number()
  .positive("Preço deve ser maior que zero")
  .max(999_999, "Preço muito alto")
  .transform((v) => Math.round(v * 100));

const productImageInputSchema = z.object({
  url: z.string().url().max(500),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
  isPrimary: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).max(100).optional().default(0),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Título muito curto").max(150, "Título muito longo"),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  price: priceInReaisToCents,
  categoryId: z.string().uuid().optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  stockQuantity: z.coerce.number().int().min(0).max(1_000_000).optional(),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  videoUrl: z.string().url().max(500).optional().or(z.literal("")),
  images: z.array(productImageInputSchema).max(10).optional().default([]),
  customizationFields: z.array(customizationFieldDefinitionSchema).max(20).optional().default([]),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productIdParamSchema = z.object({ id: z.string().uuid() });

// Allow-listed upload kinds; validated again server-side against actual file bytes,
// never trusted from the client's declared mimetype alone.
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 60 * 1024 * 1024;
