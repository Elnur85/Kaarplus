---
title: Testing Workflow
description: Testing workflow covering unit, integration, and E2E tests following project patterns.
triggers:
  - "Write tests"
  - "Run tests"
  - "Test feature"
---

# Testing Workflow

## Goal
Ensure comprehensive test coverage (Unit > Integration > E2E) for reliable, maintainable code.

## 1. Structure & Organization
- **Unit Tests (Vitest)**: Co-located with source (`component.test.tsx`, `util.test.ts`). Focus on logic & isolation.
- **Integration Tests (Vitest)**: `apps/api/src/routes/*`. Focus on API endpoints & DB interactions.
- **E2E Tests (Playwright)**: `apps/web/e2e/*.spec.ts`. Focus on critical user journeys.

## 2. Unit Testing (Vitest)
Use `vitest` for fast unit testing. Mock boundaries (Prisma, Stores).

### Utilities Schema
```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from './utils';

describe('formatPrice', () => {
  it('formats currency correctly', () => {
    expect(formatPrice(100)).toBe('100 €');
  });
});
```

### Services (with Mocks)
```typescript
// services/listing.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ListingService } from './listingService';
import { prisma } from '@kaarplus/database';

vi.mock('@kaarplus/database', () => ({
  prisma: { listing: { findMany: vi.fn() } }
}));

describe('ListingService', () => {
  it('fetches listings', async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
    const service = new ListingService();
    const res = await service.getAll();
    expect(res).toEqual([]);
  });
});
```

### Components (React Testing Library)
```typescript
// components/card.test.tsx
import { render, screen } from '@testing-library/react';
import { Card } from './card';

it('renders content', () => {
  render(<Card title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

## 3. Integration Testing (API)
Use `supertest` for API routes.

```typescript
import request from 'supertest';
import { app } from '../app';

describe('GET /api/data', () => {
  it('returns 200 OK', async () => {
    const res = await request(app).get('/api/data');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
```

## 4. E2E Testing (Playwright)
Located in `apps/web/e2e`. Focus on: Auth, Purchase, Search.

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'user@test.com');
  await page.fill('input[name="pass"]', '123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 5. Operations
| Task | Command |
|------|---------|
| **Unit/Int** | `npm run test` |
| **Watch** | `npm run test:watch` |
| **Specific** | `npm run test -- file.test.ts` |
| **E2E** | `npm run test:e2e` |
| **Debug E2E** | `npm run test:e2e -- --ui` |

## 6. Guidelines
- **Coverage**: Aim for >70% Unit, >60% Integration.
- **Cleanliness**:
  - Use `beforeEach`/`afterEach` for DB cleanup.
  - Use Factories (`test/factories.ts`) for data generation.
  - Avoid hardcoded sleeps; use `waitFor` or `await expect`.
- **Naming**: `should [action] when [condition]`.
