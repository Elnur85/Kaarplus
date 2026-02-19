---
title: Error Handling Rules
description: Exact error handling patterns for API and frontend, including error classes, response formats, and display patterns.
triggers:
  - "apps/api/src/utils/errors.ts"
  - "apps/api/src/middleware/errorHandler.ts"
  - "apps/web/src/components/**"
  - "*.tsx"
---

# Error Handling Rules

## API Error Pattern

### Error Classes (apps/api/src/utils/errors.ts)

```typescript
// Base class - never throw directly
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Use specific subclasses
export class ValidationError extends AppError {
  constructor(message = "Validation failed", public readonly details?: unknown) {
    super(message, 400, ErrorCode.VALIDATION_ERROR);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", code: ErrorCode = ErrorCode.VALIDATION_ERROR) {
    super(message, 400, code);
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, ErrorCode.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code: ErrorCode = ErrorCode.NOT_FOUND) {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists", code: ErrorCode = ErrorCode.CONFLICT) {
    super(message, 409, code);
  }
}
```

### Error Response Format

All API errors must follow this exact format:

```json
{
  "error": "Human-readable message in Estonian",
  "message": "Same as error (alias for compatibility)",
  "code": "ERROR_CODE",
  "details": {} // Optional, for validation errors
}
```

### Throwing Errors in Services/Controllers

```typescript
// ✅ CORRECT - Throw specific error
if (!listing) {
  throw new NotFoundError("Listing not found");
}

if (listing.userId !== userId && !isAdmin) {
  throw new ForbiddenError("You don't have permission to edit this listing");
}

// ✅ CORRECT - Validation with details
const result = schema.safeParse(data);
if (!result.success) {
  throw new ValidationError("Validation failed", result.error.issues);
}

// ❌ WRONG - Generic error
throw new Error("Something went wrong");

// ❌ WRONG - String error
throw "Not found";
```

### Error Handler Middleware (apps/api/src/middleware/errorHandler.ts)

The error handler:
1. Catches all errors
2. Handles Prisma unique constraint violations (P2002)
3. Formats AppError instances
4. Logs unexpected errors
5. Returns generic message in production

**Never modify error handling logic without updating this documentation.**

---

## Frontend Error Pattern

### API Client Error Handling

```typescript
// lib/api.ts
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new ApiError(
      error.error || 'Unknown error',
      error.code,
      error.details,
      res.status
    );
  }

  return res.json();
}

// Custom error class for frontend
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
    public readonly statusCode?: number
  ) {
    super(message);
  }
}
```

### Displaying Errors in Components

```typescript
"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ListingForm() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (data: FormData) => {
    try {
      setError(null);
      setFieldErrors({});
      
      await createListing(data);
      // Success handling
    } catch (err) {
      if (err instanceof ApiError) {
        // Handle specific error codes
        switch (err.code) {
          case 'VALIDATION_ERROR':
            if (err.details) {
              // Map field errors
              const errors: Record<string, string> = {};
              err.details.forEach((issue: { path: string[]; message: string }) => {
                errors[issue.path[0]] = issue.message;
              });
              setFieldErrors(errors);
            }
            break;
          case 'UNAUTHORIZED':
            setError(t('errors.sessionExpired'));
            // Redirect to login
            break;
          case 'FORBIDDEN':
            setError(t('errors.noPermission'));
            break;
          case 'CONFLICT':
            setError(t('errors.alreadyExists'));
            break;
          default:
            setError(err.message);
        }
      } else {
        // Unknown error
        setError(t('errors.unknown'));
        console.error('Unexpected error:', err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Form fields with fieldErrors */}
    </form>
  );
}
```

### Error Boundary Pattern

```typescript
// components/error-boundary.tsx
"use client";

import { Component, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold">{t('errors.somethingWentWrong')}</h2>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-primary text-white rounded"
      >
        {t('actions.retry')}
      </button>
    </div>
  );
}
```

---

## Error Code Mapping

| Code | HTTP | UI Message Key | When to Use |
|------|------|----------------|-------------|
| `INTERNAL_ERROR` | 500 | `errors.unknown` | Unexpected server error |
| `VALIDATION_ERROR` | 400 | `errors.validationFailed` | Request validation failed |
| `UNAUTHORIZED` | 401 | `errors.sessionExpired` | Not authenticated |
| `FORBIDDEN` | 403 | `errors.noPermission` | No permission for action |
| `NOT_FOUND` | 404 | `errors.notFound` | Resource doesn't exist |
| `CONFLICT` | 409 | `errors.alreadyExists` | Duplicate/Conflict |
| `LISTING_NOT_FOUND` | 404 | `errors.listingNotFound` | Specific to listings |
| `USER_NOT_FOUND` | 404 | `errors.userNotFound` | Specific to users |
| `CAMPAIGN_NOT_FOUND` | 404 | `errors.campaignNotFound` | Specific to ad campaigns |

---

## Prisma Error Handling

The error handler automatically converts Prisma errors:

```typescript
// P2002 - Unique constraint violation
if (prismaError.code === "P2002") {
  const target = prismaError.meta?.target || [];
  let message = "Kirje on juba olemas"; // Estonian default

  if (target.includes("vin")) {
    message = "See VIN-kood on juba mõne teise kuulutuse juures kasutusel";
  } else if (target.includes("email")) {
    message = "See e-posti aadress on juba registreeritud";
  }

  return res.status(409).json({
    error: message,
    message: message,
    code: "CONFLICT",
  });
}
```

**Don't handle Prisma errors in controllers** - let the error handler do it.

---

## Logging Errors

### Backend Logging

```typescript
import { logger } from './utils/logger';

// Log operational errors
logger.info('User action failed', { userId, action, error: err.message });

// Log unexpected errors
logger.error('Unexpected error', { 
  error: err.message, 
  stack: err.stack,
  path: req.path 
});

// Never log sensitive data
// ❌ WRONG
logger.error('Login failed', { email, password });

// ✅ CORRECT
logger.error('Login failed', { email: maskEmail(email) });
```

### Frontend Logging

```typescript
// Log to console in development
if (process.env.NODE_ENV === 'development') {
  console.error('API Error:', error);
}

// Log to Sentry in production
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error, {
  tags: { component: 'ListingForm' },
  extra: { listingId: id }
});
```

---

## Testing Error Handling

### API Error Tests

```typescript
// __tests__/routes/listings.test.ts
it('should return 404 for non-existent listing', async () => {
  const res = await request(app)
    .get('/api/listings/non-existent-id');
  
  expect(res.status).toBe(404);
  expect(res.body.code).toBe('NOT_FOUND');
});

it('should return 403 for unauthorized update', async () => {
  const res = await request(app)
    .patch('/api/listings/other-users-listing')
    .set('Cookie', authCookie)
    .send({ price: 10000 });
  
  expect(res.status).toBe(403);
  expect(res.body.code).toBe('FORBIDDEN');
});
```

---

## Forbidden Patterns

```typescript
// ❌ Never swallow errors
try {
  await apiCall();
} catch (e) {
  // Silent failure - user sees nothing
}

// ✅ Always handle or re-throw
try {
  await apiCall();
} catch (e) {
  logger.error('API call failed', e);
  throw new AppError('Operation failed', 500);
}

// ❌ Never expose internal details in production
if (err instanceof Error) {
  res.status(500).json({ error: err.message }); // Leaks internals
}

// ✅ Use generic message in production
const message = process.env.NODE_ENV === 'production'
  ? 'Internal server error'
  : err.message;
```

---

**Last Updated:** 2026-02-19  
**Source:** `apps/api/src/utils/errors.ts`, `apps/api/src/middleware/errorHandler.ts`
