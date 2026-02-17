---
title: Code Review Workflow
description: Comprehensive code review process that checks for SOLID principles, DRY violations, security issues, functionality completeness, and code quality before approving changes.
triggers:
  - "Review code"
  - "Code review"
  - "Check PR"
  - "Review changes"
---

# Code Review Workflow

## Goal
Perform a thorough code review that ensures code quality, adherence to principles, security, and functionality.

## Pre-Review Checklist

Before starting the review, ensure:
- [ ] All automated checks pass (lint, typecheck, tests)
- [ ] PR description is clear and includes context
- [ ] Changes are focused and reasonably sized

## Review Steps

### Step 1: SOLID Principles Audit

#### Single Responsibility Principle (SRP)
```typescript
// ❌ BAD - Multiple responsibilities
class ListingManager {
  createListing() { }
  sendEmail() { }
  processPayment() { }
  generateReport() { }
}

// ✅ GOOD - Single responsibility
class ListingService {
  createListing() { }
}

class EmailService {
  sendEmail() { }
}
```
**Check:** Each class/function has one reason to change

#### Open/Closed Principle (OCP)
```typescript
// ❌ BAD - Modify existing code for new features
function calculatePrice(listing: Listing) {
  if (listing.type === 'premium') return listing.price * 0.9;
  return listing.price;
}

// ✅ GOOD - Extend without modifying
interface PricingStrategy {
  calculate(listing: Listing): number;
}

class PremiumPricing implements PricingStrategy {
  calculate(listing: Listing) { return listing.price * 0.9; }
}
```
**Check:** New features add code, don't change existing

#### Liskov Substitution Principle (LSP)
```typescript
// ❌ BAD - Subclass changes behavior
class VehicleListing {
  getPrice() { return this.price; }
}

class AuctionListing extends VehicleListing {
  getPrice() { throw new Error('Use getCurrentBid()'); } // Violates LSP
}
```
**Check:** Subclasses can substitute parent classes

#### Interface Segregation Principle (ISP)
```typescript
// ❌ BAD - Fat interface
interface UserService {
  createUser(): void;
  deleteUser(): void;
  sendEmail(): void;
  generateReport(): void;
}

// ✅ GOOD - Split interfaces
interface UserCRUDService {
  createUser(): void;
  deleteUser(): void;
}

interface UserNotificationService {
  sendEmail(): void;
}
```
**Check:** Clients don't depend on unused methods

#### Dependency Inversion Principle (DIP)
```typescript
// ❌ BAD - Direct dependency
class ListingController {
  private service = new ListingService(); // Concrete dependency
}

// ✅ GOOD - Dependency injection
class ListingController {
  constructor(private service: ListingServiceInterface) { }
}
```
**Check:** Depend on abstractions, not concretions

### Step 2: DRY Principle Audit

**Check for duplication:**
- [ ] Repeated logic in components → Extract to hook/utility
- [ ] Repeated API calls → Extract to service function
- [ ] Repeated validation → Extract to shared schema
- [ ] Repeated styles → Extract to component/class
- [ ] Repeated type definitions → Extract to shared types

```typescript
// ❌ BAD - Duplicated validation
// In component A
if (!email.includes('@')) setError('Invalid email');

// In component B
if (!email.includes('@')) setError('Invalid email');

// ✅ GOOD - Shared validation
// schemas/validation.ts
export const emailSchema = z.string().email();

// Used in both components
emailSchema.parse(email);
```

### Step 3: CLEAN Code Audit

#### Naming
- [ ] Variables describe intent, not type (`userList` not `array`)
- [ ] Functions are verbs (`getUserById` not `userData`)
- [ ] Booleans are predicates (`isLoading` not `loading`)
- [ ] Constants are descriptive (`MAX_LISTINGS` not `5`)

#### Functions
- [ ] Small functions (< 20 lines)
- [ ] Single responsibility
- [ ] Max 3 parameters (use object for more)
- [ ] No side effects in pure functions

#### Comments
- [ ] Code explains itself (no "what" comments)
- [ ] Comments explain "why", not "what"
- [ ] JSDoc for public APIs
- [ ] No commented-out code

#### Formatting
- [ ] Consistent indentation
- [ ] Related code grouped together
- [ ] Vertical separation between concepts

### Step 4: Consistency Audit

**Check against existing patterns:**
- [ ] Same naming conventions as existing code
- [ ] Same file organization
- [ ] Same error handling approach
- [ ] Same styling patterns
- [ ] Same testing patterns

**Compare with similar files:**
```bash
# Find similar files to compare patterns
grep -r "similarPattern" apps/web/src/components/
grep -r "similarPattern" apps/api/src/services/
```

### Step 5: Security Audit

#### Input Validation
- [ ] All inputs validated with Zod
- [ ] No SQL injection (Prisma used correctly)
- [ ] No XSS (React escaping, no dangerous HTML)

#### Authentication/Authorization
- [ ] Routes protected appropriately
- [ ] Resource ownership checked
- [ ] Role-based access verified

#### Sensitive Data
- [ ] No secrets in code
- [ ] No sensitive data logged
- [ ] Proper cookie settings

#### Dependencies
- [ ] No vulnerable dependencies (`npm audit`)
- [ ] No unnecessary dependencies added

### Step 6: Functionality Audit

#### Check for Placeholders
- [ ] No `TODO` comments without tickets
- [ ] No `FIXME` without explanation
- [ ] No mock data in production code
- [ ] No hardcoded test values

#### Button/Action Verification
```typescript
// ❌ BAD - Placeholder handler
<button onClick={() => console.log('clicked')}>Submit</button>
<button onClick={() => {}}>Save</button> // Empty handler

// ✅ GOOD - Implemented handler
<button onClick={handleSubmit} disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</button>
```

**Verify:**
- [ ] All buttons have working handlers
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Success feedback provided

#### API Endpoints
- [ ] All endpoints return correct responses
- [ ] Error responses follow standard format
- [ ] Status codes are appropriate
- [ ] Edge cases handled

### Step 7: Testing Audit

- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows
- [ ] Edge cases covered
- [ ] Tests are deterministic

### Step 8: Performance Audit

- [ ] No unnecessary re-renders
- [ ] Proper memoization where needed
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Images optimized

## Review Response Format

```markdown
## Code Review Summary

### ✅ Approved / 🔄 Changes Requested

### SOLID Principles
- [ ] SRP - Single Responsibility
- [ ] OCP - Open/Closed
- [ ] LSP - Liskov Substitution
- [ ] ISP - Interface Segregation
- [ ] DIP - Dependency Inversion

### DRY Principle
- [ ] No code duplication found
- [ ] Shared utilities used appropriately

### CLEAN Code
- [ ] Clear naming
- [ ] Small functions
- [ ] Self-documenting code

### Consistency
- [ ] Follows project patterns
- [ ] Matches existing code style

### Security
- [ ] Input validation
- [ ] Auth/authorization
- [ ] No sensitive data exposure

### Functionality
- [ ] No placeholders
- [ ] All actions implemented
- [ ] Error handling

### Testing
- [ ] Adequate test coverage
- [ ] Edge cases covered

### Required Changes
1. [Specific change with line reference]
2. [Specific change with line reference]

### Suggestions (Non-blocking)
1. [Improvement suggestion]
2. [Improvement suggestion]
```

## Review Decision Matrix

| Issue Severity | Action |
|---------------|--------|
| Security vulnerability | **BLOCK** - Must fix before merge |
| Breaking change | **BLOCK** - Must fix before merge |
| SOLID violation | **REQUEST CHANGE** - Should fix |
| DRY violation | **REQUEST CHANGE** - Should fix |
| Clean code issue | **SUGGEST** - Nice to have |
| Missing tests | **REQUEST CHANGE** - Required |
| Style inconsistency | **SUGGEST** - Use formatter |

## Post-Review Actions

1. **If approved:** Merge or request merge from author
2. **If changes requested:** 
   - Clearly document required changes
   - Provide code examples where helpful
   - Set expectation for re-review
3. **Follow-up:** Verify changes address feedback
