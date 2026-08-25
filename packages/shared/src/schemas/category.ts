import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120, "Nome muito longo"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  imageUrl: z.string().url().max(500).optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(1000).optional().default(0),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const updateCategorySchema = categorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const categoryIdParamSchema = z.object({ id: z.string().uuid() });
