import { z } from "zod";
import { nameSchema, phoneSchema } from "./auth.js";

// Validates the CPF check-digit algorithm, not just the format — catches typos and
// placeholder junk ("00000000000", "12345678900" etc) that a regex alone would miss.
function isValidCpfChecksum(digits: string): boolean {
  if (/^(\d)\1{10}$/.test(digits)) return false; // all same digit

  const calcCheckDigit = (base: string, factor: number): number => {
    let sum = 0;
    for (const digit of base) {
      sum += Number(digit) * factor;
      factor -= 1;
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const first = calcCheckDigit(digits.slice(0, 9), 10);
  const second = calcCheckDigit(digits.slice(0, 9) + first, 11);
  return digits === digits.slice(0, 9) + String(first) + String(second);
}

export const cpfSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length === 11, "CPF precisa ter 11 dígitos")
  .refine(isValidCpfChecksum, "CPF inválido");

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional().or(z.literal("")),
  cpf: cpfSchema.optional().or(z.literal("")),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
