import { z } from "zod";
import { PASSWORD_POLICY } from "../constants/index.js";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(255)
  .email("E-mail inválido");

export const passwordSchema = z
  .string()
  .min(PASSWORD_POLICY.minLength, `A senha precisa ter pelo menos ${PASSWORD_POLICY.minLength} caracteres`)
  .max(PASSWORD_POLICY.maxLength, "Senha muito longa")
  .regex(/[A-Za-z]/, "A senha precisa conter pelo menos uma letra")
  .regex(/[0-9]/, "A senha precisa conter pelo menos um número");

// Full name: letters (incl. accented), spaces, apostrophes and hyphens only.
export const nameSchema = z
  .string()
  .trim()
  .min(2, "Nome muito curto")
  .max(120, "Nome muito longo")
  .regex(/^[\p{L} '.-]+$/u, "Nome contém caracteres inválidos");

// Loose but bounded — accepts BR formats like (11) 91234-5678, digits only, etc.
export const phoneSchema = z
  .string()
  .trim()
  .min(8, "Telefone inválido")
  .max(20, "Telefone inválido")
  .regex(/^[0-9()+\-.\s]+$/, "Telefone contém caracteres inválidos");

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha").max(PASSWORD_POLICY.maxLength),
  rememberMe: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(PASSWORD_POLICY.maxLength),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
