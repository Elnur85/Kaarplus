# P5-T03: Test Infrastructure Setup + API Unit Tests

> **Phase:** 5 — Production Readiness
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T03, P1-T07
> **Estimated Time:** 6 hours

## Problem Statement

There are ZERO unit tests and ZERO integration tests in the project. No test runner is configured for either `apps/api` or `apps/web`. The only tests are 4 E2E Playwright specs (1 skipped).

## Implementation Steps

### Step 1: Configure Vitest for API

```bash
# In apps/api/
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest
```

Create `apps/api/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/controllers/**', 'src/routes/**', 'src/middleware/**'],
    },
  },
});
```

Create `apps/api/src/__tests__/setup.ts`:
```ts
// Mock Prisma, set test env vars
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
});
```

Add to `apps/api/package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Step 2: Configure Vitest for Web

```bash
# In apps/web/
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Create `apps/web/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Step 3: Write API Unit Tests

#### Auth Routes (`src/__tests__/routes/auth.test.ts`)
- POST /api/auth/register — valid data → 201 + token
- POST /api/auth/register — duplicate email → 400
- POST /api/auth/register — weak password → 400
- POST /api/auth/login — valid credentials → 200 + token
- POST /api/auth/login — wrong password → 401
- POST /api/auth/login — nonexistent user → 401
- GET /api/auth/session — valid token → 200
- GET /api/auth/session — no token → 401
- POST /api/auth/logout → 200 + cookie cleared

#### Listings Controller (`src/__tests__/controllers/listing.test.ts`)
- GET /api/listings — returns paginated list
- GET /api/listings?make=BMW — filters work
- GET /api/listings/:id — returns single listing
- POST /api/listings — authenticated → creates listing
- POST /api/listings — unauthenticated → 401
- PATCH /api/listings/:id — owner can update
- PATCH /api/listings/:id — non-owner → 403

#### Favorites (`src/__tests__/controllers/favorite.test.ts`)
- POST /api/user/favorites/:id — adds favorite
- DELETE /api/user/favorites/:id — removes favorite
- GET /api/user/favorites — returns user favorites

#### Admin Routes (`src/__tests__/routes/admin.test.ts`)
- GET /api/admin/pending — admin → returns list
- GET /api/admin/pending — non-admin → 403
- POST /api/admin/approve/:id — updates listing status
- POST /api/admin/reject/:id — updates listing status

#### Messages (`src/__tests__/controllers/message.test.ts`)
- POST /api/user/messages — sends message
- GET /api/user/messages — returns conversations
- GET /api/user/messages/unread-count — returns count

#### Reviews (`src/__tests__/controllers/review.test.ts`)
- POST /api/reviews — creates review
- GET /api/reviews/seller/:id — returns seller reviews

#### Payments (`src/__tests__/controllers/payment.test.ts`)
- POST /api/payments/create-session — creates Stripe checkout
- POST /api/webhooks/stripe — handles payment completion

### Step 4: Configure Root Test Script

Update root `package.json`:
```json
{
  "scripts": {
    "test": "npm run test --workspaces --if-present",
    "test:api": "npm run test --workspace=apps/api",
    "test:web": "npm run test --workspace=apps/web",
    "test:e2e": "npx playwright test",
    "test:coverage": "npm run test:coverage --workspaces --if-present"
  }
}
```

## Acceptance Criteria

- [ ] `npm run test --workspace=apps/api` runs and passes
- [ ] `npm run test --workspace=apps/web` runs (even if few tests initially)
- [ ] Auth routes have full test coverage (register, login, session, logout)
- [ ] Listings CRUD has test coverage
- [ ] Admin routes tested for authorization
- [ ] Favorites, Messages, Reviews have basic tests
- [ ] CI workflow (`.github/workflows/ci.yml`) runs `npm run test` in quality job
- [ ] Coverage reports generated via `test:coverage`
