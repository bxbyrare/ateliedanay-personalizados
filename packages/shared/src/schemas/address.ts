import { z } from "zod";
import { BRAZILIAN_STATES } from "../constants/index.js";
import { phoneSchema } from "./auth.js";

export const cepSchema = z
  .string()
  .trim()
  .regex(/^\d{5}-?\d{3}$/, "CEP inválido")
  .transform((v) => v.replace("-", ""));

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Informe um nome para o endereço").max(60),
  recipientName: z.string().trim().min(2).max(120),
  cep: cepSchema,
  street: z.string().trim().min(2).max(150),
  number: z.string().trim().min(1).max(20),
  complement: z.string().trim().max(100).optional().or(z.literal("")),
  neighborhood: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  state: z.enum(BRAZILIAN_STATES, { message: "UF inválida" }),
  phone: phoneSchema,
  isDefault: z.boolean().optional().default(false),
});
export type AddressInput = z.infer<typeof addressSchema>;
