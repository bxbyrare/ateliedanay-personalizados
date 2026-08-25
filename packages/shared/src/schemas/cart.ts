import { z } from "zod";
import { CART_ITEM_MAX_QUANTITY, CUSTOMIZATION_VALUE_MAX_LENGTH } from "../constants/index.js";

// Keys are ProductCustomizationField ids; values are bounded strings.
// Server re-validates each value against that specific product's field definitions
// (required/type/maxLength/options) — this schema only bounds the shape/size of the payload.
export const customizationValuesSchema = z
  .record(
    z.string().uuid(),
    z.string().trim().max(CUSTOMIZATION_VALUE_MAX_LENGTH),
  )
  .refine((obj) => Object.keys(obj).length <= 30, "Muitos campos de personalização");

export const addCartItemSchema = z.object({
  productId: z.string().uuid("Produto inválido"),
  quantity: z.number().int().min(1).max(CART_ITEM_MAX_QUANTITY),
  customizationValues: customizationValuesSchema.optional().default({}),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(CART_ITEM_MAX_QUANTITY).optional(),
  customizationValues: customizationValuesSchema.optional(),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const cartItemIdParamSchema = z.object({
  itemId: z.string().uuid(),
});
