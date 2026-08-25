import type { Order } from "@prisma/client";

export interface PaymentIntentResult {
  provider: string;
  reference: string;
  status: string;
}

// Abstraction so a real gateway (Mercado Pago, Stripe, etc.) can be dropped in later
// without touching the order/checkout flow. Not wired to any real provider yet — the
// client will choose a gateway in a future session.
export interface PaymentProvider {
  createPaymentIntent(order: Order): Promise<PaymentIntentResult>;
  handleWebhook(payload: unknown, signature: string | undefined): Promise<void>;
  refund(order: Order): Promise<void>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPaymentIntent(order: Order): Promise<PaymentIntentResult> {
    return { provider: "mock", reference: `mock_${order.id}`, status: "pending" };
  }

  async handleWebhook(): Promise<void> {
    // No-op until a real provider is wired up.
  }

  async refund(): Promise<void> {
    // No-op until a real provider is wired up.
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
