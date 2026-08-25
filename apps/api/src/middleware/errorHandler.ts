import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { isProduction } from "../config/env.js";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { message: "Rota não encontrada" } });
}

// Deliberately typed with 4 params (even though `next` is unused) — Express only
// recognizes a handler as an error handler when its arity is exactly 4.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Dados inválidos",
        fields: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof MulterError) {
    res.status(400).json({ error: { message: "Falha no upload: " + err.message } });
    return;
  }

  // csrf-csrf throws a plain Error with a `code`/`statusCode`, not our AppError —
  // map it explicitly so an expired/mismatched CSRF token surfaces as 403, not 500.
  if (err instanceof Error && (err as { code?: string }).code === "EBADCSRFTOKEN") {
    res.status(403).json({ error: { message: "Token CSRF inválido ou expirado" } });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, "Unhandled application error");
    }
    res.status(err.statusCode).json({
      error: { message: err.message, fields: err.fields },
    });
    return;
  }

  logger.error({ err, path: req.path }, "Unexpected error");
  res.status(500).json({
    error: { message: isProduction ? "Erro interno do servidor" : String(err) },
  });
}
