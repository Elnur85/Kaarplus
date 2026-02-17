---
name: test-generator
description: Generates comprehensive test suites for React components, API endpoints, services, and utilities following Vitest and Playwright patterns. Creates unit tests, integration tests, and E2E tests with proper mocking and assertions.
triggers:
  - "Generate tests"
  - "Create tests"
  - "Write tests"
  - "Test for"
  - "Add test coverage"
  - "Unit test"
  - "E2E test"
  - "Integration test"
---

# Test Generator Skill

## Goal
Generate comprehensive test suites following project testing conventions with Vitest for unit/integration tests and Playwright for E2E tests.

## Test Types

### 1. Unit Tests
- Test individual functions/units in isolation
- Mock all dependencies
- Fast execution
- Located colocated with source files (`*.test.ts`)

### 2. Integration Tests
- Test API endpoints with database
- Test service layer with real database
- Slower than unit tests
- Located in `apps/api/src/**/*.test.ts`

### 3. E2E Tests
- Test complete user flows
- Use real browser (Playwright)
- Test critical paths only
- Located in `e2e/**/*.spec.ts`

## Step-by-Step Instructions

### Step 1: Identify What to Test

**For Components:**
- Rendering with different props
- User interactions (clicks, inputs)
- Edge cases (empty states, errors)
- Accessibility (keyboard navigation)

**For Services:**
- Business logic
- Error handling
- Database interactions
- Authorization checks

**For API Endpoints:**
- Success responses
- Error responses
- Validation
- Authentication/authorization

### Step 2: Create Test File

```bash
# Unit test (colocated)
touch src/components/shared/vehicle-card.test.tsx

# API integration test
touch apps/api/src/services/listingService.test.ts

# E2E test
touch e2e/listings.spec.ts
```

### Step 3: Write Unit Test

```typescript
// components/shared/vehicle-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VehicleCard } from './vehicle-card';

// Mock data factory
const createMockListing = (overrides = {}) => ({
  id: '1',
  make: 'Toyota',
  model: 'Corolla',
  year: 2020,
  price: 15000,
  mileage: 50000,
  images: [{ url: '/test.jpg' }],
  user: { id: 'u1', name: 'Test Seller', role: 'INDIVIDUAL_SELLER' },
  ...overrides,
});

describe('VehicleCard', () => {
  describe('rendering', () => {
    it('should display vehicle make and model', () => {
      const listing = createMockListing();
      render(<VehicleCard listing={listing} />);
      
      expect(screen.getByText('Toyota')).toBeInTheDocument();
      expect(screen.getByText('Corolla')).toBeInTheDocument();
    });
    
    it('should display formatted price', () => {
      const listing = createMockListing({ price: 15000 });
      render(<VehicleCard listing={listing} />);
      
      expect(screen.getByText('15 000 € (km-ga)')).toBeInTheDocument();
    });
    
    it('should display year badge', () => {
      const listing = createMockListing({ year: 2020 });
      render(<VehicleCard listing={listing} />);
      
      expect(screen.getByText('2020')).toBeInTheDocument();
    });
    
    it('should show placeholder when no images', () => {
      const listing = createMockListing({ images: [] });
      render(<VehicleCard listing={listing} />);
      
      expect(screen.getByAltText('Toyota Corolla')).toHaveAttribute(
        'src',
        '/placeholder.jpg'
      );
    });
  });
  
  describe('interactions', () => {
    it('should call onFavorite when favorite button clicked', () => {
      const onFavorite = vi.fn();
      const listing = createMockListing();
      render(<VehicleCard listing={listing} onFavorite={onFavorite} />);
      
      fireEvent.click(screen.getByLabelText('Add to favorites'));
      
      expect(onFavorite).toHaveBeenCalledWith('1');
    });
    
    it('should link to listing detail page', () => {
      const listing = createMockListing({ id: '123' });
      render(<VehicleCard listing={listing} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/listings/123');
    });
  });
  
  describe('accessibility', () => {
    it('should have proper alt text for images', () => {
      const listing = createMockListing();
      render(<VehicleCard listing={listing} />);
      
      expect(screen.getByAltText('Toyota Corolla')).toBeInTheDocument();
    });
    
    it('should support keyboard navigation', () => {
      const listing = createMockListing();
      render(<VehicleCard listing={listing} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('tabIndex', '0');
    });
  });
});
```

### Step 4: Write Service Test

```typescript
// apps/api/src/services/listingService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListingService } from './listingService';
import { prisma } from '@kaarplus/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';

// Mock Prisma
vi.mock('@kaarplus/database', () => ({
  prisma: {
    listing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('ListingService', () => {
  let service: ListingService;
  
  beforeEach(() => {
    service = new ListingService();
    vi.clearAllMocks();
  });
  
  describe('getAllListings', () => {
    it('should return paginated results', async () => {
      const mockListings = [
        { id: '1', make: 'Toyota', model: 'Corolla' },
        { id: '2', make: 'Honda', model: 'Civic' },
      ];
      vi.mocked(prisma.listing.findMany).mockResolvedValue(mockListings);
      vi.mocked(prisma.listing.count).mockResolvedValue(2);
      
      const result = await service.getAllListings({
        page: 1,
        pageSize: 10,
        sort: 'newest',
      });
      
      expect(result.data).toEqual(mockListings);
      expect(result.meta).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });
    });
    
    it('should filter by make', async () => {
      vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
      vi.mocked(prisma.listing.count).mockResolvedValue(0);
      
      await service.getAllListings({
        page: 1,
        pageSize: 10,
        sort: 'newest',
        make: 'Toyota',
      });
      
      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            make: { equals: 'Toyota', mode: 'insensitive' },
          }),
        })
      );
    });
    
    it('should only show ACTIVE listings for non-admin users', async () => {
      vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
      vi.mocked(prisma.listing.count).mockResolvedValue(0);
      
      await service.getAllListings(
        { page: 1, pageSize: 10, sort: 'newest' },
        false // isAdmin = false
      );
      
      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });
  });
  
  describe('createListing', () => {
    it('should create listing with PENDING status', async () => {
      const mockUser = { id: 'user-1', role: 'DEALERSHIP' };
      const mockListing = { id: 'listing-1', make: 'Toyota' };
      
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.listing.create).mockResolvedValue(mockListing as any);
      
      const result = await service.createListing('user-1', {
        make: 'Toyota',
        model: 'Corolla',
      } as any);
      
      expect(prisma.listing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          make: 'Toyota',
          model: 'Corolla',
          userId: 'user-1',
          status: 'PENDING',
        }),
      });
      expect(result).toEqual(mockListing);
    });
    
    it('should enforce 5 listing limit for individual sellers', async () => {
      const mockUser = { id: 'user-1', role: 'INDIVIDUAL_SELLER' };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.listing.count).mockResolvedValue(5);
      
      await expect(
        service.createListing('user-1', { make: 'Toyota' } as any)
      ).rejects.toThrow(ForbiddenError);
    });
    
    it('should throw NotFoundError if user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      
      await expect(
        service.createListing('nonexistent', { make: 'Toyota' } as any)
      ).rejects.toThrow(NotFoundError);
    });
  });
  
  describe('updateListing', () => {
    it('should update listing for owner', async () => {
      const mockListing = { id: '1', userId: 'user-1' };
      vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
      vi.mocked(prisma.listing.update).mockResolvedValue({ ...mockListing, price: 20000 } as any);
      
      const result = await service.updateListing('1', 'user-1', false, {
        price: 20000,
      });
      
      expect(result.price).toBe(20000);
    });
    
    it('should allow admin to update any listing', async () => {
      const mockListing = { id: '1', userId: 'user-1' };
      vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
      vi.mocked(prisma.listing.update).mockResolvedValue(mockListing as any);
      
      await service.updateListing('1', 'admin-1', true, { price: 20000 });
      
      expect(prisma.listing.update).toHaveBeenCalled();
    });
    
    it('should throw ForbiddenError for non-owner non-admin', async () => {
      const mockListing = { id: '1', userId: 'user-1' };
      vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
      
      await expect(
        service.updateListing('1', 'user-2', false, { price: 20000 })
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
```

### Step 5: Write E2E Test

```typescript
// e2e/listings.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('Listings', () => {
  test.describe('Browse Listings', () => {
    test('should display listings on homepage', async ({ page }) => {
      await page.goto('/');
      
      // Verify listings are displayed
      const listings = page.locator('[data-testid="listing-card"]');
      await expect(listings.first()).toBeVisible();
      
      // Verify listing has required elements
      const firstListing = listings.first();
      await expect(firstListing.locator('[data-testid="listing-make"]')).toBeVisible();
      await expect(firstListing.locator('[data-testid="listing-price"]')).toBeVisible();
    });
    
    test('should filter listings by make', async ({ page }) => {
      await page.goto('/listings');
      
      // Select make filter
      await page.selectOption('[data-testid="make-filter"]', 'Toyota');
      await page.click('[data-testid="apply-filters"]');
      
      // Verify only Toyota listings are shown
      const listings = page.locator('[data-testid="listing-card"]');
      const count = await listings.count();
      
      for (let i = 0; i < count; i++) {
        await expect(listings.nth(i)).toContainText('Toyota');
      }
    });
    
    test('should navigate to listing detail', async ({ page }) => {
      await page.goto('/listings');
      
      // Click first listing
      await page.click('[data-testid="listing-card"]:first-child');
      
      // Verify detail page loaded
      await expect(page).toHaveURL(/\/listings\/[\w-]+/);
      await expect(page.locator('[data-testid="listing-detail-title"]')).toBeVisible();
    });
  });
  
  test.describe('Create Listing', () => {
    test('should require authentication', async ({ page }) => {
      await page.goto('/sell');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
    
    test('should create listing as authenticated user', async ({ page }) => {
      // Login first
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('seller@example.com', 'password123');
      
      // Navigate to sell page
      await page.goto('/sell');
      
      // Fill form
      await page.selectOption('[name="make"]', 'Toyota');
      await page.fill('[name="model"]', 'Corolla');
      await page.fill('[name="year"]', '2020');
      await page.fill('[name="price"]', '15000');
      await page.fill('[name="mileage"]', '50000');
      await page.selectOption('[name="fuelType"]', 'Petrol');
      await page.selectOption('[name="transmission"]', 'Automatic');
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Verify success
      await expect(page.getByText('Kuulutus edukalt lisatud')).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard\/listings/);
    });
    
    test('should validate required fields', async ({ page }) => {
      // Login
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('seller@example.com', 'password123');
      
      await page.goto('/sell');
      
      // Submit empty form
      await page.click('button[type="submit"]');
      
      // Verify validation errors
      await expect(page.getByText('Mark on kohustuslik')).toBeVisible();
      await expect(page.getByText('Mudel on kohustuslik')).toBeVisible();
    });
  });
  
  test.describe('Favorites', () => {
    test('should add listing to favorites', async ({ page }) => {
      // Login
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('buyer@example.com', 'password123');
      
      // Go to listings
      await page.goto('/listings');
      
      // Click favorite button
      await page.click('[data-testid="favorite-button"]:first-child');
      
      // Verify success message
      await expect(page.getByText('Lisatud lemmikutesse')).toBeVisible();
      
      // Verify in favorites page
      await page.goto('/favorites');
      const favorites = page.locator('[data-testid="favorite-item"]');
      await expect(favorites.first()).toBeVisible();
    });
  });
});
```

## Test Utilities

### Mock Factories

```typescript
// test/factories.ts
import { prisma } from '@kaarplus/database';

export function createUser(overrides = {}) {
  return prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      role: 'BUYER',
      ...overrides,
    },
  });
}

export function createListing(userId: string, overrides = {}) {
  return prisma.listing.create({
    data: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      price: 15000,
      mileage: 50000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      colorExterior: 'Silver',
      condition: 'Used',
      location: 'Tallinn',
      userId,
      ...overrides,
    },
  });
}
```

### Test Setup

```typescript
// test/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '@kaarplus/database';

beforeAll(async () => {
  // Connect to test database
});

afterEach(async () => {
  // Clean up after each test
  await prisma.$transaction([
    prisma.favorite.deleteMany(),
    prisma.listing.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

## Constraints

### DO
- [ ] Test behavior, not implementation
- [ ] Use descriptive test names
- [ ] Follow Arrange-Act-Assert pattern
- [ ] Mock external dependencies
- [ ] Clean up test data
- [ ] Test edge cases

### DON'T
- [ ] Test private methods
- [ ] Share state between tests
- [ ] Test multiple things in one test
- [ ] Use sleep/wait without reason
- [ ] Ignore test failures
