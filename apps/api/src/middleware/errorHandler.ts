import { Request, Response, NextFunction } from "express";

import { AppError, NotFoundError, ConflictError, ValidationError } from "../utils/errors";
import { logger } from "../utils/logger";

/**
 * Global error handler middleware.
 * Must be the last middleware registered.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Prisma-specific errors ────────────────────────────────────────────────
  const prismaError = err as {
    code?: string;
    meta?: { target?: string[]; cause?: string; field_name?: string };
  };

  if (prismaError.code === "P2002") {
    // Unique constraint violation
    const target = prismaError.meta?.target ?? [];
    let message = "Kirje on juba olemas";
    if (target.includes("vin")) {
      message = "See VIN-kood on juba mõne teise kuulutuse juures kasutusel";
    } else if (target.includes("email")) {
      message = "See e-posti aadress on juba registreeritud";
    } else if (target.length > 0) {
      message = `Väljal "${target.join(", ")}" on kirje juba olemas`;
    }
    const conflictErr = new ConflictError(message);
    res.status(conflictErr.statusCode).json({
      error: conflictErr.message,
      message: conflictErr.message,
      code: conflictErr.code,
    });
    return;
  }

  if (prismaError.code === "P2025") {
    // Record required for the operation was not found
    const cause = prismaError.meta?.cause ?? "Kirjet ei leitud";
    const notFoundErr = new NotFoundError(cause);
    res.status(notFoundErr.statusCode).json({
      error: notFoundErr.message,
      message: notFoundErr.message,
      code: notFoundErr.code,
    });
    return;
  }

  if (prismaError.code === "P2003") {
    // Foreign-key constraint failed
    const field = prismaError.meta?.field_name ?? "seotud kirje";
    const message = `Seotud kirjet ei leitud (${field})`;
    res.status(400).json({
      error: message,
      message,
      code: "VALIDATION_ERROR",
    });
    return;
  }

  if (prismaError.code === "P2014") {
    // Required relation violation
    const message = "Kohustuslik seos puudub — kontrollige seotud andmeid";
    res.status(400).json({ error: message, message, code: "VALIDATION_ERROR" });
    return;
  }

  // ── Known operational (AppError) errors ──────────────────────────────────
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: err.message,
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // ── Unknown / programming errors ──────────────────────────────────────────
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
  });

  // In production hide raw stack/internals but still give a useful message.
  // Common Node/library errors get a translated description.
  const message = mapUnhandledError(err);

  res.status(500).json({
    error: message,
    message,
    code: "INTERNAL_ERROR",
  });
}

/**
 * Converts common unhandled Node/library errors into user-friendly Estonian messages.
 * Falls back to a generic message in production to avoid leaking internals.
 */
function mapUnhandledError(err: Error): string {
  if (process.env.NODE_ENV !== "production") {
    // Show the real message in dev/test for debugging
    return err.message;
  }

  const msg = err.message.toLowerCase();

  if (msg.includes("connect") || msg.includes("econnrefused") || msg.includes("etimedout")) {
    return "Andmebaasiga ühenduse loomine ebaõnnestus — palun proovige hiljem uuesti";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "Päring aegus — palun proovige hiljem uuesti";
  }
  if (msg.includes("jwt") || msg.includes("token")) {
    return "Seansi viga — palun logige uuesti sisse";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Võrgu viga — kontrollige ühendust";
  }

  return "Serveri viga — palun proovige hiljem uuesti";
}
