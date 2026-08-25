import { z } from "zod";
import { PAGINATION, CUSTOMIZATION_FIELD_TYPES } from "../constants/index.js";

export const productListQuerySchema = z.object({
  categorySlug: z.string().trim().min(1).max(120).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.maxLimit).optional().default(PAGINATION.defaultLimit),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Slug inválido"),
});

export const customizationFieldDefinitionSchema = z.object({
  label: z.string().trim().min(1).max(120),
  fieldType: z.enum(CUSTOMIZATION_FIELD_TYPES),
  isRequired: z.boolean().default(false),
  maxLength: z.number().int().min(1).max(500).default(200),
  options: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  helpText: z.string().trim().max(300).optional(),
  sortOrder: z.number().int().min(0).max(1000).default(0),
});
export type CustomizationFieldDefinitionInput = z.infer<typeof customizationFieldDefinitionSchema>;
