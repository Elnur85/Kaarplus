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

### File Organization
```
apps/api/src/
├── index.ts           # Entry point (server start)
├── app.ts             # Express app configuration
├── routes/            # Route definitions
│   ├── index.ts       # Route aggregator
│   ├── listings.ts    # Listing routes
│   ├── auth.ts        # Auth routes
│   └── ...
├── controllers/       # Request handlers
│   ├── listingController.ts
│   └── ...
├── services/          # Business logic
│   ├── listingService.ts
│   └── ...
├── middleware/        # Express middleware
│   ├── auth.ts        # JWT verification
│   ├── validate.ts    # Request validation
│   ├── errorHandler.ts
│   └── ...
├── schemas/           # Zod validation schemas
│   ├── listing.ts
│   └── ...
├── utils/             # Utilities
│   ├── errors.ts      # Custom errors
│   ├── logger.ts      # Logging
│   ├── s3.ts          # AWS S3
│   └── stripe.ts      # Stripe config
└── types/
    └── express.d.ts   # Type extensions
```

### Application Bootstrap
```typescript
// app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

export const app = express();

// Security middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Error handling (must be last)
app.use(errorHandler);
```

## Route Definitions

### Route Structure
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
router.post(
  '/',
  requireAuth,
  validate(createListingSchema),
  controller.createListing
);
router.patch('/:id', requireAuth, controller.updateListing);
router.delete('/:id', requireAuth, controller.deleteListing);

export default router;
```

### Route Aggregator
```typescript
// routes/index.ts
import { Router } from 'express';
import listings from './listings';
import auth from './auth';
import users from './users';

const router = Router();

router.use('/listings', listings);
router.use('/auth', auth);
router.use('/users', requireAuth, users);

export default router;
```

## Controllers

### Controller Pattern
```typescript
// controllers/listingController.ts
import { Request, Response, NextFunction } from 'express';
import { ListingService } from '../services/listingService';
import { createListingSchema } from '../schemas/listing';
import { BadRequestError } from '../utils/errors';

const listingService = new ListingService();

export const getAllListings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const listings = await listingService.getAllListings(req.query);
    res.json({ data: listings });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = createListingSchema.safeParse(req.body);
    if (!result.success) {
      throw new BadRequestError(result.error.issues[0].message);
    }
    
    const userId = req.user!.id;
    const listing = await listingService.createListing(userId, result.data);
    res.status(201).json({ data: listing });
  } catch (error) {
    next(error);
  }
};
```

### Controller Rules
1. **Thin controllers** - delegate to services
2. **Handle HTTP concerns only** (status codes, headers)
3. **Always use try-catch** or async handler
4. **Validate input** before calling services
5. **Pass user context** from req.user

## Services

### Service Pattern
```typescript
// services/listingService.ts
import { prisma, Prisma } from '@kaarplus/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export interface ListingQuery {
  page: number;
  pageSize: number;
  sort: string;
  // ... other filters
}

export class ListingService {
  async getAllListings(query: ListingQuery) {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: this.buildWhereClause(query),
        include: { images: true, user: { select: { name: true } } },
        orderBy: this.buildOrderBy(query.sort),
        skip,
        take: pageSize,
      }),
      prisma.listing.count({ where: this.buildWhereClause(query) }),
    ]);
    
    return {
      data: listings,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }
  
  async createListing(userId: string, data: Prisma.ListingCreateInput) {
    // Business logic: Check listing limits
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === 'INDIVIDUAL_SELLER') {
      const count = await prisma.listing.count({
        where: { userId, status: { in: ['ACTIVE', 'PENDING'] } },
      });
      if (count >= 5) {
        throw new ForbiddenError('Max 5 listings for individual sellers');
      }
    }
    
    return prisma.listing.create({
      data: { ...data, userId, status: 'PENDING' },
    });
  }
  
  async updateListing(
    id: string,
    userId: string,
    isAdmin: boolean,
    data: Prisma.ListingUpdateInput
  ) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundError('Listing not found');
    
    // Authorization check
    if (!isAdmin && listing.userId !== userId) {
      throw new ForbiddenError('Not authorized');
    }
    
    return prisma.listing.update({ where: { id }, data });
  }
  
  private buildWhereClause(query: ListingQuery): Prisma.ListingWhereInput {
    // Build filter logic
  }
  
  private buildOrderBy(sort: string): Prisma.ListingOrderByWithRelationInput {
    // Build sort logic
  }
}
```

### Service Rules
1. **Pure business logic** - no HTTP concerns
2. **Throw custom errors** - let error handler manage responses
3. **Authorization checks** - verify permissions
4. **Database transactions** - use $transaction for multiple ops
5. **Private helper methods** - for complex logic

## Middleware

### Auth Middleware
```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthError, ForbiddenError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET!;

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = req.cookies?.token || extractBearerToken(req);
    if (!token) throw new AuthError('Authentication required');
    
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
    next();
  } catch (error) {
    next(new AuthError('Invalid or expired token'));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AuthError('Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}
```

### Validation Middleware
```typescript
// middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestError } from '../utils/errors';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map(i => i.message).join(', ');
      return next(new BadRequestError(message));
    }
    req.body = result.data;
    next();
  };
};
```

### Error Handler
```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err, req: req.path }, 'Request error');
  
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }
  
  // Unexpected errors
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
}
```

## Database Operations

### Prisma Best Practices
```typescript
// ✅ Use include/select to control data
prisma.listing.findMany({
  include: {
    images: { orderBy: { order: 'asc' } },
    user: { select: { id: true, name: true } },
  },
});

// ✅ Use transactions for related operations
await prisma.$transaction([
  prisma.listing.update({ where: { id }, data }),
  prisma.listingImage.createMany({ data: images }),
]);

// ✅ Use count for pagination
const [items, total] = await Promise.all([
  prisma.listing.findMany({ skip, take }),
  prisma.listing.count({ where }),
]);

// ✅ Use upsert for create-or-update
prisma.user.upsert({
  where: { email },
  update: { lastLogin: new Date() },
  create: { email, name },
});
```

### Query Optimization
```typescript
// ✅ Index-aware queries
// Schema has: @@index([make, model])
prisma.listing.findMany({
  where: { make: 'Toyota', model: 'Corolla' },
});

// ✅ Avoid N+1 with include
prisma.listing.findMany({
  include: { images: true }, // Fetches in single query
});

// ✅ Pagination for large datasets
const PAGE_SIZE = 20;
prisma.listing.findMany({
  skip: (page - 1) * PAGE_SIZE,
  take: PAGE_SIZE,
});
```

## Error Handling

### Custom Error Classes
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}
```

## Response Format

### Standard Response Structure
```typescript
// Success response
{
  "data": {
    "id": "...",
    "make": "Toyota",
    // ...
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error response
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

## External Services

### S3 File Operations
```typescript
// utils/s3.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_S3_REGION });

export async function uploadFile(key: string, buffer: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
}

export async function deleteFile(url: string) {
  const key = extractKeyFromUrl(url);
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  }));
}
```

### Stripe Integration
```typescript
// utils/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Webhook handling
export function constructStripeEvent(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
```

## Testing

### Service Tests
```typescript
// services/listingService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListingService } from './listingService';

describe('ListingService', () => {
  let service: ListingService;
  
  beforeEach(() => {
    service = new ListingService();
  });
  
  it('should enforce listing limit for individual sellers', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// routes/listings.test.ts
import request from 'supertest';
import { app } from '../app';

describe('GET /api/listings', () => {
  it('should return paginated listings', async () => {
    const res = await request(app)
      .get('/api/listings')
      .query({ page: 1, pageSize: 10 });
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });
});
```

## Logging

### Structured Logging
```typescript
// utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' 
    ? { target: 'pino-pretty' } 
    : undefined,
});

// Usage
logger.info({ userId, listingId }, 'Listing created');
logger.error({ err, req: req.path }, 'Request failed');
```
