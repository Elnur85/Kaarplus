/**
 * Custom error classes for the application.
 * Provides structured error handling with HTTP status codes and error codes.
 */

/**
 * Error codes for API responses.
 * Used to identify specific error types on the client side.
 */
export enum ErrorCode {
  // General errors (1xx)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  
  // Authentication errors (2xx)
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  
  // Resource errors (3xx)
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  
  // Domain-specific errors (4xx)
  LISTING_NOT_FOUND = "LISTING_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  FAVORITE_NOT_FOUND = "FAVORITE_NOT_FOUND",
  ALREADY_FAVORITED = "ALREADY_FAVORITED",
  CANNOT_MESSAGE_SELF = "CANNOT_MESSAGE_SELF",
  RECIPIENT_NOT_FOUND = "RECIPIENT_NOT_FOUND",
  EMAIL_SEND_FAILED = "EMAIL_SEND_FAILED",

  // Ad & Campaign errors
  CAMPAIGN_NOT_FOUND = "CAMPAIGN_NOT_FOUND",
  AD_NOT_FOUND = "AD_NOT_FOUND",
  AD_UNIT_NOT_FOUND = "AD_UNIT_NOT_FOUND",
  CAMPAIGN_BUDGET_EXCEEDED = "CAMPAIGN_BUDGET_EXCEEDED",
}

/**
 * Base application error class.
 * All custom errors should extend this class.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: ErrorCode;

  constructor(
    message: string,
    statusCode = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Validation error - 422 Unprocessable Entity
 * Used when request data fails validation (semantic errors).
 */
export class ValidationError extends AppError {
  public readonly details: unknown;

  constructor(message = "Validation failed", details?: unknown) {
    super(message, 422, ErrorCode.VALIDATION_ERROR);
    this.details = details;
  }
}

/**
 * Bad request error - 400 Bad Request
 * Used for general malformed requests.
 */
export class BadRequestError extends AppError {
  constructor(message = "Bad Request", code: ErrorCode = ErrorCode.VALIDATION_ERROR) {
    super(message, 400, code);
  }
}

/**
 * Authentication error - 401 Unauthorized
 * Used when user is not authenticated.
 */
export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, ErrorCode.UNAUTHORIZED);
  }
}

/**
 * Forbidden error - 403 Forbidden
 * Used when user lacks permission for the operation.
 */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}

/**
 * Not found error - 404 Not Found
 * Used when a requested resource does not exist.
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code: ErrorCode = ErrorCode.NOT_FOUND) {
    super(message, 404, code);
  }
}

/**
 * Conflict error - 409 Conflict
 * Used when there's a resource conflict (e.g., duplicate).
 */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists", code: ErrorCode = ErrorCode.CONFLICT) {
    super(message, 409, code);
  }
}

/**
 * Service unavailable error - 503 Service Unavailable
 * Used when a dependent service (e.g., email) is unavailable.
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable") {
    super(message, 503, ErrorCode.INTERNAL_ERROR);
  }
}
