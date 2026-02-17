---
title: Feature Implementation Workflow
description: Step-by-step workflow for implementing new features following project conventions, ensuring code quality, security, and comprehensive testing.
triggers:
  - "Implement feature"
  - "Add feature"
  - "Build feature"
  - "Create feature"
  - "New feature"
---

# Feature Implementation Workflow

## Goal
Implement new features following all project conventions, ensuring high quality, security, and maintainability.

## Pre-Implementation Phase

### Step 1: Understand Requirements
- [ ] Read relevant documentation in `docs/`
- [ ] Check `docs/IMPLEMENTATION_PLAN.md` for phase/task
- [ ] Review Figma designs (if UI feature)
- [ ] Understand acceptance criteria

### Step 2: Technical Planning
- [ ] Identify affected components/services
- [ ] Plan database changes (if any)
- [ ] Design API contracts
- [ ] Identify reusable components
- [ ] Plan test strategy

### Step 3: Check Dependencies
```bash
# Check if related work is complete
git log --oneline --grep="related-feature"

# Check for blocking tasks in docs/tasks/
cat docs/tasks/P1-T*.md | grep -A5 "status"
```

## Implementation Phase

### Step 4: Database Changes (if applicable)

```bash
# Navigate to database package
cd packages/database

# Edit schema.prisma
# Add migrations
npm run migrate:dev -- --name descriptive_name

# Generate client
npm run generate

# Verify migration
npm run studio
```

**Rules:**
- Use `cuid()` for primary keys
- Add indexes for query performance
- Use appropriate field types
- Document enums

### Step 5: Backend Implementation

#### 5.1 Define Schema
```typescript
// apps/api/src/schemas/feature.ts
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  // ...
});

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
```

#### 5.2 Implement Service
```typescript
// apps/api/src/services/featureService.ts
import { prisma } from '@kaarplus/database';
import { NotFoundError } from '../utils/errors';

export class FeatureService {
  async create(data: CreateFeatureInput, userId: string) {
    // Business logic
    return prisma.feature.create({
      data: { ...data, userId },
    });
  }
  
  async getById(id: string) {
    const feature = await prisma.feature.findUnique({ where: { id } });
    if (!feature) throw new NotFoundError('Feature not found');
    return feature;
  }
}
```

#### 5.3 Implement Controller
```typescript
// apps/api/src/controllers/featureController.ts
import { Request, Response } from 'express';
import { FeatureService } from '../services/featureService';
import { createFeatureSchema } from '../schemas/feature';
import { BadRequestError } from '../utils/errors';

const featureService = new FeatureService();

export const createFeature = async (req: Request, res: Response) => {
  const result = createFeatureSchema.safeParse(req.body);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }
  
  const feature = await featureService.create(result.data, req.user!.id);
  res.status(201).json({ data: feature });
};
```

#### 5.4 Add Routes
```typescript
// apps/api/src/routes/feature.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as controller from '../controllers/featureController';

const router = Router();

router.post('/', requireAuth, controller.createFeature);
router.get('/:id', controller.getFeature);

export default router;
```

### Step 6: Frontend Implementation

#### 6.1 Add Types
```typescript
// apps/web/src/types/feature.ts
export interface Feature {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}
```

#### 6.2 Add API Client
```typescript
// apps/web/src/lib/api.ts
export async function createFeature(data: CreateFeatureInput) {
  const res = await fetch(`${API_URL}/api/features`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error('Failed to create feature');
  return res.json();
}
```

#### 6.3 Create Components
```typescript
// apps/web/src/components/feature/feature-form.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export function FeatureForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data: SchemaType) => {
    await createFeature(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

#### 6.4 Add i18n Strings
```json
// apps/web/messages/et/feature.json
{
  "form": {
    "title": "Uus funktsioon",
    "nameLabel": "Nimi",
    "submit": "Salvesta"
  }
}
```

#### 6.5 Create Page (if needed)
```typescript
// apps/web/src/app/(protected)/feature/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feature | Kaarplus',
};

export default function FeaturePage() {
  return (
    <div>
      <h1>Feature</h1>
      <FeatureForm />
    </div>
  );
}
```

### Step 7: Add Tests

#### 7.1 Unit Tests
```typescript
// apps/api/src/services/featureService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { FeatureService } from './featureService';

describe('FeatureService', () => {
  it('should create feature with valid data', async () => {
    const service = new FeatureService();
    const result = await service.create({ name: 'Test' }, 'user-1');
    expect(result.name).toBe('Test');
  });
});
```

#### 7.2 E2E Tests
```typescript
// e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test('user can create feature', async ({ page }) => {
  await page.goto('/feature');
  await page.fill('[name="name"]', 'Test Feature');
  await page.click('button[type="submit"]');
  await expect(page.getByText('Feature created')).toBeVisible();
});
```

## Quality Assurance Phase

### Step 8: Run Quality Checks
```bash
# Run all quality checks
npm run lint
npm run typecheck
npm run test
npm run test:e2e

# Check for security issues
npm audit
```

### Step 9: Verify Requirements
- [ ] All acceptance criteria met
- [ ] Feature works as specified
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Success feedback provided

### Step 10: Security Review
- [ ] Input validation implemented
- [ ] Authorization checks in place
- [ ] No sensitive data exposed
- [ ] Rate limiting applied (if needed)
- [ ] No security vulnerabilities

## Documentation Phase

### Step 11: Update Documentation
- [ ] Update API documentation (if applicable)
- [ ] Add JSDoc to public functions
- [ ] Update component documentation
- [ ] Add usage examples

### Step 12: Update Task Status
```markdown
<!-- In docs/tasks/PX-TXX-task-name.md -->
## Status: ✅ Complete

## Implementation Notes
- [Key decisions made]
- [Technical challenges solved]
- [Future improvements]
```

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] No console errors
- [ ] Feature flag added (if risky)
- [ ] Rollback plan documented
- [ ] Monitoring in place

## Implementation Don'ts

- ❌ Don't skip tests
- ❌ Don't ignore TypeScript errors
- ❌ Don't mix feature work with refactoring
- ❌ Don't break existing functionality
- ❌ Don't skip security review
- ❌ Don't forget i18n for user-facing text
- ❌ Don't hardcode values that should be configurable

## Common Pitfalls

### API Design
- ❌ Inconsistent response formats
- ❌ Missing error handling
- ❌ No input validation
- ✅ Use standard response format
- ✅ Validate all inputs
- ✅ Proper HTTP status codes

### Frontend
- ❌ Mixing server/client without reason
- ❌ Missing loading/error states
- ❌ No accessibility attributes
- ✅ Server Components by default
- ✅ Proper state management
- ✅ ARIA labels where needed

### Database
- ❌ Missing indexes
- ❌ N+1 queries
- ❌ No transaction for related operations
- ✅ Index frequently queried fields
- ✅ Use include/select wisely
- ✅ Use $transaction for consistency
