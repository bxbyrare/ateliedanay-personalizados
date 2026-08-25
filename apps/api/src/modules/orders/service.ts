import { randomBytes } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { AppError, NotFoundError } from "../../lib/errors.js";
import { paymentProvider } from "../payments/provider.js";
import type { CreateOrderInput } from "@ateliedanay/shared";

function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = randomBytes(3).toString("hex").toUpperCase();
  return `AD-${datePart}-${randomPart}`;
}

// The entire checkout flow re-derives truth from the database — it never trusts a
// price, subtotal, or total the client might have displayed/submitted.
export async function createOrder(userId: string, input: CreateOrderInput) {
  const address = await prisma.address.findFirst({ where: { id: input.addressId, userId } });
  if (!address) {
    throw new NotFoundError("Endereço não encontrado. Cadastre um endereço antes de finalizar a compra.");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(400, "Seu carrinho está vazio");
  }

  const inactiveItem = cart.items.find((item) => !item.product.isActive);
  if (inactiveItem) {
    throw new AppError(400, `O produto "${inactiveItem.product.name}" não está mais disponível. Remova-o do carrinho.`);
  }

  const subtotalCents = cart.items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
  // Flat-rate placeholder — real shipping cost calculation (Correios/Melhor Envio) is
  // out of scope for now; see project plan.
  const shippingCents = 0;
  const totalCents = subtotalCents + shippingCents;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        status: "aguardando_pagamento",
        subtotalCents,
        shippingCents,
        totalCents,
        addressId: address.id,
        shippingRecipient: address.recipientName,
        shippingCep: address.cep,
        shippingStreet: address.street,
        shippingNumber: address.number,
        shippingComplement: address.complement,
        shippingNeighborhood: address.neighborhood,
        shippingCity: address.city,
        shippingState: address.state,
        shippingPhone: address.phone,
        notes: input.notes || null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productNameSnapshot: item.product.name,
            unitPriceCentsSnapshot: item.product.priceCents,
            quantity: item.quantity,
            customizationValues: item.customizationValues as object,
            lineTotalCents: item.product.priceCents * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  const intent = await paymentProvider.createPaymentIntent(order);
  const finalOrder = await prisma.order.update({
    where: { id: order.id },
    data: { paymentProvider: intent.provider, paymentReference: intent.reference, paymentStatus: intent.status },
    include: { items: true },
  });

  return finalOrder;
}

export async function listOrders(userId: string, page: number, limit: number) {
  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getOrderForUser(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) throw new NotFoundError("Pedido não encontrado");
  return order;
}
