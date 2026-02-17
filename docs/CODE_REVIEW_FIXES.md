# Code Review Fixes Summary

**Branch:** code-review-comprehensive  
**Date:** 2026-02-17  

## Overview

This document summarizes the critical fixes applied during the comprehensive code review of the Kaarplus project.

---

## Critical Security Fixes

### 1. JWT Secret Hardcoded Fallback (CRITICAL)
**Files:**
- `apps/api/src/middleware/auth.ts`
- `apps/api/src/routes/auth.ts`

**Issue:** JWT_SECRET had a hardcoded fallback that could be accidentally deployed to production.

**Fix:** Changed to throw an error if JWT_SECRET is not set:
```typescript
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
})();
```

### 2. API Token Exposed in Client Session (CRITICAL)
**File:** `apps/web/src/types/next-auth.d.ts`

**Issue:** API tokens were exposed in the session, accessible client-side.

**Fix:** Removed `apiToken` from Session, User, and JWT interfaces.

### 3. Debug Endpoint Exposed in Production (CRITICAL)
**Files:**
- `apps/api/src/routes/index.ts`
- `apps/api/src/routes/debug-sentry.ts`

**Issue:** Debug endpoint accessible in production without authentication.

**Fix:** 
- Moved debug routes to `/debug` path
- Only register in non-production environments
- Dynamic import to prevent loading in production

### 4. Sentry Test Page in Production (CRITICAL)
**File:** `apps/web/src/app/sentry-test-error/page.tsx`

**Issue:** Test page should not be in production codebase.

**Fix:** Removed the entire directory.

### 5. Contact Seller Security Bypass (CRITICAL)
**File:** `apps/api/src/services/listingService.ts`

**Issue:** `senderId` was set to `listing.userId` instead of actual sender, making messages appear from seller.

**Fix:** Updated function to properly handle sender ID:
```typescript
async contactSeller(
    id: string, 
    contactData: { name: string; email: string; phone?: string; message: string },
    senderId?: string
) {
    // For anonymous users, create a system message with contact details
    // For logged-in users, use their user ID as sender
    const messageBody = senderId 
        ? contactData.message
        : `Nimi: ${contactData.name}\nEmail: ${contactData.email}...`;
    
    return prisma.message.create({
        data: {
            senderId: senderId || "system",
            recipientId: listing.userId,
            // ...
        },
    });
}
```

### 6. Components Using apiToken Instead of Cookies (CRITICAL)
**Files:**
- `apps/web/src/components/admin/analytics-dashboard.tsx`
- `apps/web/src/components/admin/listing-queue.tsx`
- `apps/web/src/components/sell/sell-wizard.tsx`

**Issue:** Components were using `apiToken` from session instead of HTTP-only cookies.

**Fix:** Changed all fetch calls to use `credentials: "include"` instead of Bearer token:
```typescript
// Before:
headers: { "Authorization": `Bearer ${session.user.apiToken}` }

// After:
credentials: "include"
```

---

## Database Schema Fixes

### 1. Missing Foreign Key Relations in Payment Model (CRITICAL)
**File:** `packages/database/prisma/schema.prisma`

**Issue:** Payment model lacked foreign key relations to User and Listing.

**Fix:** Added proper relations:
```prisma
model Payment {
  // ... fields
  listing Listing @relation(fields: [listingId], references: [id])
  buyer   User    @relation("BuyerPayments", fields: [buyerId], references: [id])
  seller  User    @relation("SellerPayments", fields: [sellerId], references: [id])
}
```

### 2. Missing Soft Delete Support (HIGH)
**File:** `packages/database/prisma/schema.prisma`

**Issue:** Listing and Message models lacked soft delete support.

**Fix:** Added `deletedAt` fields and indexes:
```prisma
model Listing {
  // ... existing fields
  deletedAt DateTime?
  @@index([deletedAt])
  @@index([userId, deletedAt])
}

model Message {
  // ... existing fields
  deletedAt DateTime?
  @@index([deletedAt])
}
```

### 3. Review Unique Constraint Bug (CRITICAL)
**File:** `packages/database/prisma/schema.prisma`

**Issue:** Unique constraint on nullable `listingId` allowed duplicates.

**Fix:** Changed to include `targetId`:
```prisma
@@unique([reviewerId, targetId, listingId])
```

### 4. Added Missing Indexes (MEDIUM)
**File:** `packages/database/prisma/schema.prisma`

**Fix:** Added composite indexes for common query patterns:
```prisma
@@index([make, model, year, price, status])
@@index([location, status, publishedAt])
```

---

## Router Configuration Fixes

### 1. Missing Router Mounts (HIGH)
**File:** `apps/api/src/routes/index.ts`

**Issue:** Newsletter and Reviews routers were not mounted.

**Fix:** Added imports and mounted routers:
```typescript
import { newsletterRouter } from "./newsletter";
import { reviewsRouter } from "./reviews";
// ...
apiRouter.use("/newsletter", newsletterRouter);
apiRouter.use("/reviews", reviewsRouter);
```

---

## Password Reset Implementation (HIGH)

### 1. Password Reset Stubs
**File:** `apps/api/src/routes/auth.ts`

**Issue:** Password reset was completely stubbed.

**Fix:** Implemented validation schemas and proper error handling:
```typescript
const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8)...,
});
```

---

## Summary of Changes

| Category | Files Changed | Issues Fixed |
|----------|--------------|--------------|
| Security | 8 | 6 critical |
| Database | 1 | 4 issues |
| API Routes | 3 | 3 issues |
| Web Components | 3 | 3 issues |
| **Total** | **15** | **16** |

---

## Remaining Issues

The following issues were identified but not fixed in this pass:

### HIGH Priority (Next Sprint)
1. **No rate limiting** on sensitive endpoints (email, messaging)
2. **No ownership verification** on listing update/delete routes
3. **Mock data** in admin pages (analytics-dashboard, listing-queue)
4. **No tests** - Entire codebase lacks test coverage
5. **Direct database access** in controllers (newsletter, review, payment)

### MEDIUM Priority
1. **Inconsistent error handling** patterns across controllers
2. **String-based error handling** instead of custom error classes
3. **No caching** for search filter options
4. **DRY violations** - Pagination logic duplicated
5. **Hardcoded Estonian text** without i18n

### LOW Priority
1. **Missing JSDoc** documentation
2. **Inconsistent code style** (2 vs 4 spaces)
3. **Unused imports** throughout codebase
4. **Magic numbers** without named constants

---

## Verification

Run the following commands to verify the fixes:

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build

# Database generation
npm run db:generate
```

---

## Next Steps

1. **Deploy to staging** and verify all authentication flows
2. **Implement password reset email** sending (currently stubbed)
3. **Add rate limiting** to sensitive endpoints
4. **Write tests** for critical paths
5. **Security audit** before production deployment
