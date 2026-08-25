import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid("Selecione um endereço de entrega"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
