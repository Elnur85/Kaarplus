import { Request, Response } from "express";
import rateLimit from "express-rate-limit";

import { logger } from "../utils/logger";

/**
 * Rate limiting configuration constants
 * Centralized configuration for easy maintenance and adjustment
 */
export const RateLimitConfig = {
  // Window durations in milliseconds
  windowMs: {
    short: 60 * 1000,      // 1 minute
    medium: 15 * 60 * 1000, // 15 minutes
    long: 60 * 60 * 1000,   // 1 hour
  },

  // Maximum requests per window
  maxRequests: {
    strict: 5,      // Very strict (password reset, etc.)
    auth: 10,       // Authentication endpoints
    write: 10,      // Write operations
    default: 30,    // General API usage
    read: 60,       // Read operations
    webhook: 100,   // Webhook endpoints
  },
} as const;

/**
 * Custom rate limit exceeded handler
 * Logs the event for security monitoring and returns standardized error
 */
function handleLimitReached(req: Request, res: Response): void {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const endpoint = `${req.method} ${req.path}`;

  logger.warn(`Rate limit exceeded`, {
    ip: clientIp,
    endpoint,
    userAgent: req.get("user-agent"),
  });

  res.status(429).json({
    error: "Too many requests",
    message: "Please slow down and try again later.",
    retryAfter: res.getHeader("Retry-After"),
  });
}

/**
 * Factory function to create rate limiters with consistent configuration
 * Follows DRY principle by centralizing common options
 */
function createRateLimiter(
  maxRequests: number,
  windowMs: number,
  message: string
): ReturnType<typeof rateLimit> {
  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,  // Disable `X-RateLimit-*` headers
    message: { error: message },
    handler: handleLimitReached,
    // Skip rate limiting in test environment or when explicitly disabled
    skip: () => process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "true",
  });
}

/**
 * Default rate limiter: 30 requests per minute per IP
 * Applied globally to all routes as a baseline protection
 */
export const defaultLimiter = createRateLimiter(
  RateLimitConfig.maxRequests.default,
  RateLimitConfig.windowMs.short,
  "Too many requests. Please try again later."
);

/**
 * Strict limiter for authentication endpoints: 10 requests per minute per IP
 * Used for login, register, password reset to prevent brute force attacks
 */
export const authLimiter = createRateLimiter(
  RateLimitConfig.maxRequests.auth,
  RateLimitConfig.windowMs.short,
  "Too many authentication attempts. Please try again later."
);

/**
 * Relaxed limiter for public read endpoints: 60 requests per minute per IP
 * Used for search, listings, filters - higher limit for browsing
 */
export const readLimiter = createRateLimiter(
  RateLimitConfig.maxRequests.read,
  RateLimitConfig.windowMs.short,
  "Too many requests. Please try again later."
);

/**
 * Write limiter for creating/updating content: 10 requests per minute per IP
 * Used for POST, PATCH, DELETE operations to prevent spam
 */
export const writeLimiter = createRateLimiter(
  RateLimitConfig.maxRequests.write,
  RateLimitConfig.windowMs.short,
  "Too many requests. Please slow down."
);

/**
 * Very strict limiter for sensitive operations: 5 requests per 15 minutes
 * Used for password reset, email verification - prevents abuse
 */
export const strictLimiter = createRateLimiter(
  RateLimitConfig.maxRequests.strict,
  RateLimitConfig.windowMs.medium,
  "Too many attempts. Please try again later."
);

/**
 * Webhook limiter: 100 requests per minute
 * Webhooks have higher limits but still protected against flooding
 */
export const webhookLimiter = createRateLimiter(
  RateLimitConfig.maxRequests.webhook,
  RateLimitConfig.windowMs.short,
  "Too many webhook requests."
);

/**
 * Admin limiter: 60 requests per minute
 * Admin operations need reasonable throughput but still protected
 */
export const adminLimiter = createRateLimiter(
  RateLimitConfig.maxRequests.read,
  RateLimitConfig.windowMs.short,
  "Too many admin requests. Please try again later."
);
