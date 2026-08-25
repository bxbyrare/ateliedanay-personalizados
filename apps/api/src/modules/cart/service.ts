import type { Product, ProductCustomizationField } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError, NotFoundError } from "../../lib/errors.js";
import { CART_ITEM_MAX_QUANTITY } from "@ateliedanay/shared";

type CustomizationValues = Record<string, string>;

// The client's customizationValues payload is only shape-bounded by the shared zod
// schema (string keys/values, size caps). The actual business rules — which fields
// exist for THIS product, which are required, per-field max length, and select options
// — are only known server-side and are re-validated here on every cart write.
export function validateCustomizationValues(
  fields: ProductCustomizationField[],
  values: CustomizationValues,
): CustomizationValues {
  const validated: CustomizationValues = {};
  const fieldIds = new Set(fields.map((f) => f.id));

  for (const key of Object.keys(values)) {
    if (!fieldIds.has(key)) {
      throw new AppError(400, "Campo de personalização inválido para este produto");
    }
  }

  for (const field of fields) {
    const raw = values[field.id];

    if (field.isRequired && (!raw || raw.trim().length === 0)) {
      throw new AppError(400, `O campo "${field.label}" é obrigatório`);
    }
    if (!raw) continue;

    const trimmed = raw.trim();
    if (trimmed.length > field.maxLength) {
      throw new AppError(400, `O campo "${field.label}" excede o tamanho máximo`);
    }

    if (field.fieldType === "select") {
      const options = Array.isArray(field.options) ? (field.options as string[]) : [];
      if (!options.includes(trimmed)) {
        throw new AppError(400, `Valor inválido para o campo "${field.label}"`);
      }
    }

    if (field.fieldType === "number" && !/^-?\d+(\.\d+)?$/.test(trimmed)) {
      throw new AppError(400, `O campo "${field.label}" deve ser numérico`);
    }

    if (field.fieldType === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      throw new AppError(400, `O campo "${field.label}" deve ser uma data válida (AAAA-MM-DD)`);
    }

    validated[field.id] = trimmed;
  }

  return validated;
}

export async function loadActiveProductOrThrow(productId: string): Promise<Product & { customizationFields: ProductCustomizationField[] }> {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    include: { customizationFields: true },
  });
  if (!product) {
    throw new NotFoundError("Produto não encontrado ou indisponível");
  }
  return product;
}

export function sameCustomization(a: CustomizationValues, b: CustomizationValues): boolean {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => a[k] === b[k]);
}

export function clampQuantity(quantity: number): number {
  return Math.min(Math.max(quantity, 1), CART_ITEM_MAX_QUANTITY);
}
