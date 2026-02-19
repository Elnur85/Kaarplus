---
title: Backend Rules
description: Express.js API development rules, service layer patterns, database operations with Prisma, and middleware configuration for the Kaarplus API.
triggers:
  - "apps/api/**/*.ts"
  - "packages/database/**/*.ts"
  - "*.prisma"
---

# Backend Rules

## Express Application Structure

```
apps/api/src/
├── index.ts           # Entry point
├── app.ts             # Express app configuration
├── routes/            # Route definitions
├── controllers/       # Request handlers
├── services/          # Business logic
├── middleware/        # Express middleware
├── schemas/           # Zod validation schemas
├── utils/             # Utilities
└── types/             # TypeScript interfaces
```

## Route Definitions

```typescript
// routes/listings.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as controller from '../controllers/listingController';
import { createListingSchema } from '../schemas/listing';

const router = Router();

// Public routes
router.get('/', controller.getAllListings);
router.get('/:id', controller.getListingById);

// Protected routes
router.post('/', requireAuth, validate(createListingSchema), controller.createListing);

export default router;
```

## Controllers

Thin controllers - delegate to services:

```typescript
// controllers/listingController.ts
import { ListingService } from '../services/listingService';

const listingService = new ListingService();

export const getAllListings = async (req, res, next) => {
  try {
    const listings = await listingService.getAllListings(req.query);
    res.json({ data: listings });
  } catch (error) {
    next(error);
  }
};
```

## Services

Pure business logic:

```typescript
// services/listingService.ts
import { prisma } from '@kaarplus/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class ListingService {
  async getAllListings(query: ListingQuery) {
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({ where: this.buildWhere(query), skip, take }),
      prisma.listing.count({ where: this.buildWhere(query) }),
    ]);
    return { data: listings, meta: { page, pageSize, total } };
  }
}
```

## Middleware

### Auth Middleware

```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { AuthError, ForbiddenError } from '../utils/errors';

export function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) throw new AuthError('Authentication required');
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
}
```

### Validation Middleware

```typescript
// middleware/validate.ts
import { BadRequestError } from '../utils/errors';

export const validate = (schema: ZodSchema, source: 'body' | 'query' = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0].message);
    }
    req[source] = result.data;
    next();
  };
};
```

## Error Handling

See `error-handling.md` for complete error handling patterns.

## Response Format

```typescript
// Success
{ data: T, meta?: { page, pageSize, total } }

// Error
{ error: string, message: string, code: string, details?: unknown }
```

## Database Rules

- Use Prisma ORM - no raw SQL without justification
- Always create migrations (never `db push` in production)
- Use `cuid()` for all primary keys
- Index frequently queried columns
- Use $transaction for multiple operations

## Testing

```typescript
// Colocated tests
import { describe, it, expect } from 'vitest';

describe('ListingService', () => {
  it('should enforce listing limit for individual sellers', async () => {
    // Test implementation
  });
});
```

## Code Quality Checklist

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] No `console.log` (use logger utility)
- [ ] No `debugger` statements
- [ ] Proper error handling
- [ ] Named exports only

## Forbidden Patterns

```typescript
// ❌ NO default exports
export default function Component() { }

// ❌ NO 'any' types
function process(data: any) { }

// ❌ NO console.log
console.log('debug');

// ❌ NO raw promises without catch
fetch('/api').then(data => setData(data));
```
