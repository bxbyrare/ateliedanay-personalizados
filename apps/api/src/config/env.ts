import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Defaults to 80 (not a "dev-friendly" port like 3000/4000) because that's what a
  // bare-metal reverse proxy without an explicit port-forwarding UI (e.g. ShardCloud)
  // is most likely to expect from a container that never advertises its own port.
  // Local dev overrides this via apps/api/.env.
  PORT: z.coerce.number().int().min(1).max(65535).default(80),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório"),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN é obrigatório"),
  COOKIE_DOMAIN: z.string().optional().default(""),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET precisa ter pelo menos 32 caracteres"),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().min(1).max(120).default(15),
  REFRESH_TOKEN_TTL_DAYS_REMEMBERED: z.coerce.number().int().min(1).max(365).default(30),
  REFRESH_TOKEN_TTL_DAYS_SESSION: z.coerce.number().int().min(1).max(30).default(1),
  CSRF_SECRET: z.string().min(32, "CSRF_SECRET precisa ter pelo menos 32 caracteres"),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(20).default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().min(1).max(120).default(15),
  // "Entrar com Google" is disabled (the endpoint 400s) until this is set — it requires
  // an OAuth client created in Google Cloud Console for this domain.
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Variáveis de ambiente inválidas:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const corsOrigins = env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
