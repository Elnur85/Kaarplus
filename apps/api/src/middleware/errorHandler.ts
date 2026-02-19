import { Request, Response, NextFunction } from "express";

import { AppError, ValidationError, ConflictError } from "../utils/errors";
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
  // Handle Prisma Unique Constraint Violations (P2002)
  const prismaError = err as { code?: string; meta?: { target?: string[] } };
  if (prismaError.code === "P2002") {
    const target = prismaError.meta?.target || [];
    let message = "Kirje on juba olemas"; // Record already exists (ET)

    if (target.includes("vin")) {
      message = "See VIN-kood on juba mõne teise kuulutuse juures kasutusel"; // This VIN is already in use (ET)
    } else if (target.includes("email")) {
      message = "See e-posti aadress on juba registreeritud";
    }

    const conflictErr = new ConflictError(message);
    res.status(conflictErr.statusCode).json({
      error: conflictErr.message,
      message: conflictErr.message,
      code: conflictErr.code,
    });
    return;
  }

  // Known operational errors
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: err.message,
      message: err.message, // Alias for frontend compatibility
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      message: err.message, // Alias for frontend compatibility
      code: err.code,
    });
    return;
  }

  // Unknown / programming errors
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
  });

  const message = process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message;

  res.status(500).json({
    error: message,
    message: message, // Alias for frontend compatibility
    code: "INTERNAL_ERROR",
  });
}
