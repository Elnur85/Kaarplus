---
name: project-scaffold
description: Scaffolds new features, modules, or pages in the Kaarplus monorepo following project conventions. Creates the complete file structure including components, API routes, services, types, and tests.
triggers:
  - "Scaffold feature"
  - "Create module"
  - "New feature"
  - "Generate structure"
  - "Setup feature"
  - "Feature template"
---

# Project Scaffold Skill

## Goal
Generate complete feature scaffolding following Kaarplus project conventions.

## Scaffolding Templates

### Template 1: Full Feature (Frontend + Backend)

Creates:
- Backend: Route, Controller, Service, Schema
- Frontend: Types, API Client, Hooks, Components, Page
- Tests: Unit and integration tests

### Template 2: Frontend Only

Creates:
- Types, API Client, Hooks, Components, Page

### Template 3: Backend Only

Creates:
- Route, Controller, Service, Schema, Types

## Step-by-Step Instructions

### Step 1: Identify Feature Requirements

- [ ] Feature name (e.g., "reviews", "saved-searches")
- [ ] Required entities/models
- [ ] API endpoints needed
- [ ] UI components needed
- [ ] User flows

### Step 2: Generate Backend Structure

```bash
# Create files
mkdir -p apps/api/src/routes
mkdir -p apps/api/src/controllers
mkdir -p apps/api/src/services
mkdir -p apps/api/src/schemas
```

#### Schema
```typescript
// apps/api/src/schemas/review.ts
import { z } from 'zod';

export const createReviewSchema = z.object({
  targetId: z.string().cuid(),
  listingId: z.string().cuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10).max(2000),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
```

#### Service
```typescript
// apps/api/src/services/reviewService.ts
import { prisma, Prisma } from '@kaarplus/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export interface ReviewQuery {
  page: number;
  pageSize: number;
  targetId?: string;
}

export class ReviewService {
  async getAllReviews(query: ReviewQuery) {
    const { page, pageSize, targetId } = query;
    const skip = (page - 1) * pageSize;
    
    const where: Prisma.ReviewWhereInput = {};
    if (targetId) where.targetId = targetId;
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: { select: { id: true, name: true, image: true } },
          listing: { select: { id: true, make: true, model: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);
    
    return {
      data: reviews,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }
  
  async getReviewById(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: { select: { id: true, name: true, image: true } },
        target: { select: { id: true, name: true } },
      },
    });
    
    if (!review) throw new NotFoundError('Review not found');
    return review;
  }
  
  async createReview(reviewerId: string, data: Prisma.ReviewCreateInput) {
    return prisma.review.create({
      data: { ...data, reviewerId },
    });
  }
  
  async updateReview(
    id: string,
    reviewerId: string,
    isAdmin: boolean,
    data: Prisma.ReviewUpdateInput
  ) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundError('Review not found');
    
    if (!isAdmin && review.reviewerId !== reviewerId) {
      throw new ForbiddenError('Not authorized to update this review');
    }
    
    return prisma.review.update({ where: { id }, data });
  }
  
  async deleteReview(id: string, reviewerId: string, isAdmin: boolean) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundError('Review not found');
    
    if (!isAdmin && review.reviewerId !== reviewerId) {
      throw new ForbiddenError('Not authorized to delete this review');
    }
    
    return prisma.review.delete({ where: { id } });
  }
}
```

#### Controller
```typescript
// apps/api/src/controllers/reviewController.ts
import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { createReviewSchema, updateReviewSchema } from '../schemas/review';
import { BadRequestError } from '../utils/errors';

const reviewService = new ReviewService();

export const getAllReviews = async (req: Request, res: Response) => {
  const reviews = await reviewService.getAllReviews({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    targetId: req.query.targetId as string,
  });
  res.json(reviews);
};

export const getReviewById = async (req: Request, res: Response) => {
  const review = await reviewService.getReviewById(req.params.id);
  res.json({ data: review });
};

export const createReview = async (req: Request, res: Response) => {
  const result = createReviewSchema.safeParse(req.body);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }
  
  const review = await reviewService.createReview(req.user!.id, result.data);
  res.status(201).json({ data: review });
};

export const updateReview = async (req: Request, res: Response) => {
  const result = updateReviewSchema.safeParse(req.body);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }
  
  const review = await reviewService.updateReview(
    req.params.id,
    req.user!.id,
    req.user!.role === 'ADMIN',
    result.data
  );
  res.json({ data: review });
};

export const deleteReview = async (req: Request, res: Response) => {
  await reviewService.deleteReview(
    req.params.id,
    req.user!.id,
    req.user!.role === 'ADMIN'
  );
  res.status(204).send();
};
```

#### Route
```typescript
// apps/api/src/routes/reviews.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as controller from '../controllers/reviewController';

const router = Router();

router.get('/', controller.getAllReviews);
router.get('/:id', controller.getReviewById);
router.post('/', requireAuth, controller.createReview);
router.patch('/:id', requireAuth, controller.updateReview);
router.delete('/:id', requireAuth, controller.deleteReview);

export default router;
```

#### Update Route Index
```typescript
// apps/api/src/routes/index.ts
import reviews from './reviews';

// Add to router
router.use('/reviews', reviews);
```

### Step 3: Generate Frontend Structure

#### Types
```typescript
// apps/web/src/types/review.ts
export interface Review {
  id: string;
  reviewerId: string;
  targetId: string;
  listingId?: string;
  rating: number;
  title?: string;
  body: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    name: string;
    image?: string;
  };
  listing?: {
    id: string;
    make: string;
    model: string;
  };
}

export interface CreateReviewInput {
  targetId: string;
  listingId?: string;
  rating: number;
  title?: string;
  body: string;
}
```

#### API Client
```typescript
// apps/web/src/lib/api/reviews.ts
import { apiClient } from './client';
import type { Review, CreateReviewInput } from '@/types/review';

const BASE_URL = '/api/reviews';

export async function getReviews(targetId?: string) {
  const params = targetId ? `?targetId=${targetId}` : '';
  return apiClient.get<{ data: Review[]; meta: PaginationMeta }>(
    `${BASE_URL}${params}`
  );
}

export async function getReview(id: string) {
  return apiClient.get<{ data: Review }>(`${BASE_URL}/${id}`);
}

export async function createReview(data: CreateReviewInput) {
  return apiClient.post<{ data: Review }>(BASE_URL, data);
}

export async function updateReview(id: string, data: Partial<CreateReviewInput>) {
  return apiClient.patch<{ data: Review }>(`${BASE_URL}/${id}`, data);
}

export async function deleteReview(id: string) {
  return apiClient.delete(`${BASE_URL}/${id}`);
}
```

#### Hooks
```typescript
// apps/web/src/hooks/use-reviews.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getReviews, createReview, deleteReview } from '@/lib/api/reviews';
import { useToast } from '@/hooks/use-toast';
import type { Review, CreateReviewInput } from '@/types/review';

export function useReviews(targetId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    loadReviews();
  }, [targetId]);
  
  const loadReviews = async () => {
    try {
      const response = await getReviews(targetId);
      setReviews(response.data?.data || []);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addReview = useCallback(async (data: CreateReviewInput) => {
    try {
      const response = await createReview(data);
      if (response.data?.data) {
        setReviews(prev => [response.data!.data, ...prev]);
        toast({ title: 'Review added!' });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to add review',
        variant: 'destructive' 
      });
    }
  }, [toast]);
  
  return { reviews, isLoading, addReview, refresh: loadReviews };
}
```

#### Components
```typescript
// apps/web/src/components/reviews/review-card.tsx
import { StarRating } from '@/components/shared/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/types/review';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.reviewer.image} />
            <AvatarFallback>{review.reviewer.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{review.reviewer.name}</h4>
              <span className="text-sm text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <StarRating rating={review.rating} />
            {review.title && (
              <h5 className="font-medium mt-2">{review.title}</h5>
            )}
            <p className="text-muted-foreground mt-1">{review.body}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

```typescript
// apps/web/src/components/reviews/review-list.tsx
"use client";

import { ReviewCard } from './review-card';
import { useReviews } from '@/hooks/use-reviews';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewListProps {
  targetId: string;
}

export function ReviewList({ targetId }: ReviewListProps) {
  const { reviews, isLoading } = useReviews(targetId);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }
  
  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No reviews yet
      </p>
    );
  }
  
  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
```

#### Page
```typescript
// apps/web/src/app/(public)/dealers/[id]/reviews/page.tsx
import { Metadata } from 'next';
import { ReviewList } from '@/components/reviews/review-list';
import { getDealer } from '@/lib/api/dealers';

interface ReviewsPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ReviewsPageProps): Promise<Metadata> {
  const dealer = await getDealer(params.id);
  return {
    title: `Reviews for ${dealer.name} | Kaarplus`,
  };
}

export default function ReviewsPage({ params }: ReviewsPageProps) {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      <ReviewList targetId={params.id} />
    </div>
  );
}
```

### Step 4: Generate Tests

```typescript
// apps/api/src/services/reviewService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ReviewService } from './reviewService';

vi.mock('@kaarplus/database', () => ({
  prisma: {
    review: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('ReviewService', () => {
  // Test implementations
});
```

### Step 5: Update Documentation

Add to `docs/API.md`:
```markdown
## Reviews

### GET /api/reviews
List all reviews

### POST /api/reviews
Create a new review (authenticated)

### GET /api/reviews/:id
Get review by ID

### PATCH /api/reviews/:id
Update review (owner or admin)

### DELETE /api/reviews/:id
Delete review (owner or admin)
```

## Examples

### Example: Complete Feature Scaffold

**User Request:** "Scaffold a complete notification system"

**Generated Structure:**
```
apps/
├── api/src/
│   ├── schemas/
│   │   └── notification.ts
│   ├── services/
│   │   └── notificationService.ts
│   ├── controllers/
│   │   └── notificationController.ts
│   └── routes/
│       ├── notifications.ts
│       └── index.ts (updated)
└── web/src/
    ├── types/
    │   └── notification.ts
    ├── lib/api/
    │   └── notifications.ts
    ├── hooks/
    │   └── use-notifications.ts
    ├── components/notifications/
    │   ├── notification-list.tsx
    │   ├── notification-item.tsx
    │   └── notification-badge.tsx
    └── app/dashboard/
        └── notifications/
            └── page.tsx
```

## Constraints

### DO
- [ ] Follow existing naming conventions
- [ ] Create all necessary files
- [ ] Add proper TypeScript types
- [ ] Include authorization checks
- [ ] Add error handling
- [ ] Create basic tests
- [ ] Update route index

### DON'T
- [ ] Don't skip the service layer
- [ ] Don't forget input validation
- [ ] Don't mix business logic in controllers
- [ ] Don't forget to handle errors
