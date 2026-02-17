---
title: Refactoring Workflow
description: Safe refactoring procedures that maintain functionality while improving code quality, applying SOLID/DRY/CLEAN principles, and ensuring comprehensive test coverage.
triggers:
  - "Refactor code"
  - "Refactor"
  - "Clean up code"
  - "Improve code quality"
  - "Apply SOLID principles"
---

# Refactoring Workflow

## Goal
Safely refactor code to improve quality, maintainability, and adherence to principles while preserving all functionality.

## Pre-Refactoring Checklist

Before starting any refactoring:
- [ ] Understand the current code thoroughly
- [ ] Identify existing tests
- [ ] Check for external dependencies
- [ ] Create a backup branch
- [ ] Ensure tests pass before starting

```bash
# Pre-refactoring verification
git checkout -b refactor/description
git push -u origin refactor/description
npm run lint
npm run typecheck
npm run test
```

## Refactoring Principles

### 1. Preserve Behavior
- **Golden Rule:** Functionality must remain identical
- No changes to public APIs without migration plan
- All existing tests must pass
- Add tests before refactoring if coverage is low

### 2. Small Steps
- One refactoring at a time
- Commit after each successful change
- Easy to revert if issues arise

### 3. Automated Verification
- Run tests after every change
- Use type checker as safety net
- Leverage IDE refactoring tools

## Refactoring Patterns

### Pattern 1: Extract Function/Method

**When:** Function is too long or does multiple things

```typescript
// BEFORE
function processListing(listing: Listing) {
  // Validate
  if (!listing.title) throw new Error('Title required');
  if (!listing.price || listing.price <= 0) throw new Error('Invalid price');
  
  // Transform
  const normalized = {
    ...listing,
    title: listing.title.trim(),
    slug: slugify(listing.title),
  };
  
  // Save
  return prisma.listing.create({ data: normalized });
}

// AFTER
function validateListing(listing: Listing): void {
  if (!listing.title) throw new Error('Title required');
  if (!listing.price || listing.price <= 0) throw new Error('Invalid price');
}

function normalizeListing(listing: Listing): ListingInput {
  return {
    ...listing,
    title: listing.title.trim(),
    slug: slugify(listing.title),
  };
}

function processListing(listing: Listing) {
  validateListing(listing);
  const normalized = normalizeListing(listing);
  return prisma.listing.create({ data: normalized });
}
```

### Pattern 2: Extract Class/Service

**When:** Class has multiple responsibilities

```typescript
// BEFORE
class UserController {
  async createUser() { }
  async deleteUser() { }
  async sendWelcomeEmail() { } // Wrong place
  async generateUserReport() { } // Wrong place
}

// AFTER
class UserController {
  constructor(
    private userService: UserService,
    private emailService: EmailService
  ) { }
  
  async createUser() {
    const user = await this.userService.create();
    await this.emailService.sendWelcome(user);
  }
}

class UserService {
  async create() { }
  async delete() { }
}

class EmailService {
  async sendWelcome(user: User) { }
}
```

### Pattern 3: Remove Duplication (DRY)

**When:** Same code appears in multiple places

```typescript
// BEFORE - Duplicated in 3 components
// Component A
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('et-EE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

// Component B - Same code
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('et-EE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

// AFTER - Shared utility
// lib/formatters.ts
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('et-EE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

// Both components import from lib/formatters
```

### Pattern 4: Rename for Clarity

**When:** Names don't clearly express intent

```typescript
// BEFORE
const d = new Date();
const x = users.filter(u => u.a > 5);

// AFTER
const currentDate = new Date();
const activeUsers = users.filter(user => user.age > 5);
```

### Pattern 5: Replace Conditional with Polymorphism

**When:** Complex switch/if-else chains

```typescript
// BEFORE
function calculatePrice(listing: Listing, userType: string) {
  if (userType === 'dealership') {
    return listing.price * 0.95;
  } else if (userType === 'premium') {
    return listing.price * 0.90;
  } else {
    return listing.price;
  }
}

// AFTER
interface PricingStrategy {
  calculate(listing: Listing): number;
}

class DealershipPricing implements PricingStrategy {
  calculate(listing: Listing) { return listing.price * 0.95; }
}

class PremiumPricing implements PricingStrategy {
  calculate(listing: Listing) { return listing.price * 0.90; }
}

class StandardPricing implements PricingStrategy {
  calculate(listing: Listing) { return listing.price; }
}
```

### Pattern 6: Dependency Injection

**When:** Direct dependencies make testing hard

```typescript
// BEFORE
class ListingService {
  private emailService = new EmailService(); // Hard dependency
  
  async createListing(data: ListingInput) {
    const listing = await prisma.listing.create({ data });
    await this.emailService.notifyAdmin(listing); // Hard to mock
    return listing;
  }
}

// AFTER
class ListingService {
  constructor(
    private emailService: EmailServiceInterface,
    private listingRepository: ListingRepositoryInterface
  ) { }
  
  async createListing(data: ListingInput) {
    const listing = await this.listingRepository.create(data);
    await this.emailService.notifyAdmin(listing);
    return listing;
  }
}
```

## Refactoring Checklist by Principle

### SOLID Refactoring

#### Single Responsibility
- [ ] Split classes with > 3 responsibilities
- [ ] Extract methods > 20 lines
- [ ] Separate business logic from presentation

#### Open/Closed
- [ ] Replace conditionals with strategy pattern
- [ ] Use composition over inheritance
- [ ] Extract interfaces for extensibility

#### Liskov Substitution
- [ ] Ensure subclasses don't override parent behavior unexpectedly
- [ ] Check preconditions aren't strengthened in subclasses
- [ ] Check postconditions aren't weakened in subclasses

#### Interface Segregation
- [ ] Split fat interfaces
- [ ] Ensure clients use all interface methods
- [ ] Create role-specific interfaces

#### Dependency Inversion
- [ ] Depend on abstractions (interfaces)
- [ ] Use dependency injection
- [ ] Avoid `new` in business logic

### DRY Refactoring

- [ ] Extract duplicated logic to utilities
- [ ] Create shared components for repeated UI
- [ ] Use shared validation schemas
- [ ] Centralize API call patterns
- [ ] Extract magic numbers to constants

### CLEAN Refactoring

- [ ] Rename unclear variables/functions
- [ ] Extract explanatory variables
- [ ] Remove unnecessary comments
- [ ] Simplify complex conditionals
- [ ] Remove dead code

## Safety Procedures

### 1. Characterization Tests
If no tests exist, write tests first to document current behavior:

```typescript
// Write tests that pass with current code
describe('ListingService (characterization)', () => {
  it('should behave like current implementation', async () => {
    const result = await service.process(input);
    expect(result).toEqual(expectedOutput); // Document current behavior
  });
});
```

### 2. Parallel Implementation
For risky changes, implement new version alongside old:

```typescript
// Keep old version
function processListingOld(listing: Listing) { }

// Create new version
function processListingNew(listing: Listing) { }

// Feature flag
const useNewVersion = process.env.USE_NEW_LISTING_PROCESSOR;
const processListing = useNewVersion ? processListingNew : processListingOld;
```

### 3. Incremental Migration
For API changes, support both versions temporarily:

```typescript
// Support old and new parameter format
function processListing(input: ListingInput | LegacyListingInput) {
  const normalized = 'oldField' in input 
    ? migrateFromLegacy(input) 
    : input;
  return process(normalized);
}
```

## Refactoring Steps

### Step 1: Identify Target
- Review code against principles
- Identify smells (long methods, duplication, etc.)
- Prioritize by impact and risk

### Step 2: Ensure Test Coverage
- Run existing tests
- Add missing tests
- Verify tests pass

### Step 3: Apply Refactoring
- Make small, focused changes
- Use IDE refactoring tools when possible
- Run tests after each change

### Step 4: Verify Behavior
- All tests pass
- No TypeScript errors
- Manual testing if needed
- Performance check if applicable

### Step 5: Clean Up
- Remove unused code
- Update documentation
- Review for new opportunities

## Post-Refactoring Checklist

- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] Linting passes
- [ ] No functionality changed
- [ ] Code is cleaner/more maintainable
- [ ] PR description explains changes
- [ ] Breaking changes documented (if any)

## Common Refactoring Targets

### High Priority
1. **Long functions** (> 30 lines)
2. **Large classes** (> 200 lines)
3. **Duplicated code** (3+ occurrences)
4. **Deep nesting** (> 3 levels)
5. **God classes** (too many responsibilities)

### Medium Priority
1. **Unclear names**
2. **Feature envy** (class uses another class's data)
3. **Data clumps** (data that belongs together)
4. **Primitive obsession** (overuse of primitives)

### Low Priority
1. **Comments** (replace with clear code)
2. **Dead code**
3. **Minor formatting**

## Refactoring Don'ts

- ❌ Don't refactor without tests
- ❌ Don't change functionality during refactor
- ❌ Don't refactor production code under pressure
- ❌ Don't mix refactoring with feature work
- ❌ Don't refactor across module boundaries in one go
- ❌ Don't ignore compiler warnings
- ❌ Don't skip running tests

## Emergency Revert Procedure

If refactoring introduces issues:

```bash
# Revert to last known good state
git reset --hard HEAD~1  # If committed
git checkout .           # If uncommitted

# Or revert specific commit
git revert <commit-hash>
```
