import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError, UnauthorizedError } from "../../lib/errors.js";
import { validateCustomizationValues, loadActiveProductOrThrow, sameCustomization, clampQuantity } from "./service.js";
import type { AddCartItemInput, UpdateCartItemInput } from "@ateliedanay/shared";
import { z } from "zod";
import { addCartItemSchema } from "@ateliedanay/shared";

export const mergeCartSchema = z.object({
  items: z.array(addCartItemSchema).max(50),
});

function requireUserId(req: Request): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

async function getOrCreateCart(userId: string) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: { items: { include: { product: { include: { images: true } } }, orderBy: { createdAt: "asc" } } },
  });
  return cart;
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const cart = await getOrCreateCart(userId);
  res.status(200).json({ cart });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const input = req.body as AddCartItemInput;

  const product = await loadActiveProductOrThrow(input.productId);
  const customizationValues = validateCustomizationValues(product.customizationFields, input.customizationValues);
  const quantity = clampQuantity(input.quantity);

  const cart = await prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });

  const existingItems = await prisma.cartItem.findMany({ where: { cartId: cart.id, productId: product.id } });
  const match = existingItems.find((item) =>
    sameCustomization(item.customizationValues as Record<string, string>, customizationValues),
  );

  if (match) {
    await prisma.cartItem.update({
      where: { id: match.id },
      data: { quantity: clampQuantity(match.quantity + quantity), priceCentsSnapshot: product.priceCents },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity,
        customizationValues,
        priceCentsSnapshot: product.priceCents,
      },
    });
  }

  const updatedCart = await getOrCreateCart(userId);
  res.status(200).json({ cart: updatedCart });
});

async function getOwnedCartItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    include: { product: { include: { customizationFields: true } } },
  });
  if (!item) throw new NotFoundError("Item não encontrado no carrinho");
  return item;
}

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { itemId } = req.params as unknown as { itemId: string };
  const input = req.body as UpdateCartItemInput;

  const item = await getOwnedCartItem(userId, itemId);

  const customizationValues = input.customizationValues
    ? validateCustomizationValues(item.product.customizationFields, input.customizationValues)
    : undefined;

  await prisma.cartItem.update({
    where: { id: item.id },
    data: {
      ...(input.quantity !== undefined ? { quantity: clampQuantity(input.quantity) } : {}),
      ...(customizationValues !== undefined ? { customizationValues } : {}),
      priceCentsSnapshot: item.product.priceCents,
    },
  });

  const cart = await getOrCreateCart(userId);
  res.status(200).json({ cart });
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { itemId } = req.params as unknown as { itemId: string };
  await getOwnedCartItem(userId, itemId);
  await prisma.cartItem.delete({ where: { id: itemId } });
  const cart = await getOrCreateCart(userId);
  res.status(200).json({ cart });
});

// Merges an anonymous (pre-login) localStorage cart into the user's real cart on
// login/register. Every item is independently re-validated exactly like addItem —
// the client's local cart is never trusted as-is.
export const mergeCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { items } = req.body as { items: AddCartItemInput[] };

  const cart = await prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });

  for (const rawItem of items) {
    const product = await loadActiveProductOrThrow(rawItem.productId).catch(() => null);
    if (!product) continue; // silently skip items that no longer exist/are inactive
    let customizationValues: Record<string, string>;
    try {
      customizationValues = validateCustomizationValues(product.customizationFields, rawItem.customizationValues);
    } catch {
      continue; // skip invalid customization rather than failing the whole merge
    }
    const quantity = clampQuantity(rawItem.quantity);

    const existingItems = await prisma.cartItem.findMany({ where: { cartId: cart.id, productId: product.id } });
    const match = existingItems.find((item) =>
      sameCustomization(item.customizationValues as Record<string, string>, customizationValues),
    );

    if (match) {
      await prisma.cartItem.update({
        where: { id: match.id },
        data: { quantity: clampQuantity(match.quantity + quantity), priceCentsSnapshot: product.priceCents },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: product.id, quantity, customizationValues, priceCentsSnapshot: product.priceCents },
      });
    }
  }

  const updatedCart = await getOrCreateCart(userId);
  res.status(200).json({ cart: updatedCart });
});
