---
title: Debugging Workflow
description: Systematic debugging process for identifying, isolating, and fixing bugs in the Kaarplus application with proper logging and root cause analysis.
triggers:
  - "Debug"
  - "Fix bug"
  - "Troubleshoot"
  - "Investigate error"
  - "Find issue"
---

# Debugging Workflow

## Goal
Systematically identify, isolate, and fix bugs with proper root cause analysis.

## Phase 1: Problem Definition

### Step 1: Gather Information
- [ ] Exact error message
- [ ] Steps to reproduce
- [ ] Environment (dev/staging/prod)
- [ ] Browser/device (if frontend)
- [ ] User role/permissions
- [ ] Time of occurrence
- [ ] Recent changes/deployments

### Step 2: Reproduce the Issue
```
Reproduction Steps:
1. Go to ___________
2. Click on ___________
3. Enter ___________
4. Observe ___________

Expected: ___________
Actual: ___________
```

**If not reproducible:**
- Check race conditions
- Verify environment differences
- Check data state
- Review timing issues

## Phase 2: Isolate the Problem

### Step 3: Binary Search Isolation

**Frontend:**
```typescript
// Add debug logging
console.log('Debug: Component render', { props, state });
console.log('Debug: API response', data);
console.log('Debug: Form values', form.getValues());

// Or use debugger
debugger; // Browser will pause here
```

**Backend:**
```typescript
import { logger } from './utils/logger';

// Add structured logging
logger.debug({ 
  userId, 
  listingId, 
  input: req.body 
}, 'Processing request');

// Check specific point
logger.info('Debug checkpoint A reached');
```

### Step 4: Check Logs

```bash
# Frontend console
# Open browser DevTools → Console

# Backend logs
npm run dev:api  # Watch terminal output

# Check Sentry for errors
# https://sentry.io/organizations/kaarplus/issues/
```

### Step 5: Database Investigation

```bash
# Open Prisma Studio
npm run db:studio

# Or query directly
psql $DATABASE_URL

# Common queries
SELECT * FROM "Listing" WHERE id = 'xxx';
SELECT * FROM "User" WHERE email = 'xxx';
```

## Phase 3: Root Cause Analysis

### Common Frontend Issues

#### Issue: Component not rendering
**Check:**
- [ ] Data fetching (loading state)
- [ ] Conditional rendering logic
- [ ] Error boundaries
- [ ] Props being passed correctly

#### Issue: Form not submitting
**Check:**
- [ ] Validation errors (console)
- [ ] onSubmit handler bound
- [ ] Event prevention
- [ ] API call in network tab

#### Issue: State not updating
**Check:**
- [ ] State immutability
- [ ] Async update timing
- [ ] Selector dependencies
- [ ] Store subscription

### Common Backend Issues

#### Issue: 500 Internal Server Error
**Check:**
```bash
# Server logs
Error: Cannot read property 'id' of undefined
    at ListingService.createListing

# Common causes:
- Missing await
- Null reference
- Database constraint violation
```

#### Issue: Authentication Error
**Check:**
```bash
# Token validity
jwt.decode(token)  # Check expiration

# Cookie settings
# Check httpOnly, secure, sameSite

# CORS configuration
# Check origin whitelist
```

#### Issue: Database Error
**Check:**
```sql
-- Connection issues
SELECT 1;  -- Test connection

-- Constraint violations
\d "Listing"  -- Check constraints

-- Missing indexes
EXPLAIN ANALYZE SELECT * FROM "Listing" WHERE make = 'Toyota';
```

## Phase 4: Fix Implementation

### Step 6: Create Minimal Fix

```typescript
// BEFORE (buggy)
function processListing(data: ListingInput) {
  return prisma.listing.create({
    data: {
      ...data,
      userId: data.userId, // Might be undefined
    },
  });
}

// AFTER (fixed)
function processListing(data: ListingInput, userId: string) {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }
  
  return prisma.listing.create({
    data: {
      ...data,
      userId,
    },
  });
}
```

### Step 7: Add Regression Test

```typescript
// Test that reproduces the bug
it('should throw error when userId is missing', async () => {
  await expect(
    service.processListing(data, '')
  ).rejects.toThrow('User ID is required');
});
```

### Step 8: Verify Fix

```bash
# Run tests
npm run test

# Run specific test
npm run test -- debugged-feature

# Manual verification
# Follow reproduction steps
```

## Debugging Tools

### Frontend Tools

#### React DevTools
```bash
# Install browser extension
# Components tab - inspect props/state
# Profiler tab - check renders
```

#### Network Tab
```
DevTools → Network
- Check API calls
- Verify request/response
- Check status codes
- Inspect headers
```

#### Console Methods
```javascript
// Grouped logging
console.group('User Action');
console.log('Step 1');
console.log('Step 2');
console.groupEnd();

// Table for arrays
console.table(users);

// Trace execution
console.trace('Where am I?');

// Time operations
console.time('operation');
// ... code
console.timeEnd('operation');
```

### Backend Tools

#### Logger Configuration
```typescript
// utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  },
});

// Usage levels
logger.trace('Very detailed');
logger.debug('Debug info');
logger.info('General info');
logger.warn('Warning');
logger.error('Error occurred');
logger.fatal('Critical error');
```

#### Debugger
```bash
# Start with debugger
node --inspect-brk dist/index.js

# Or with tsx
npx tsx --inspect-brk src/index.ts

# Open chrome://inspect in Chrome
```

### Database Debugging

```bash
# Enable query logging
# In schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

# Or log in code
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Common Bug Patterns

### Frontend

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Blank page | Error in render | Check Error Boundary, console |
| Infinite loop | Missing dependency | Add to useEffect deps |
| Stale data | Closure issue | Use functional update |
| Form reset | Key prop change | Stable key value |
| Slow render | Large list | Virtualize list |

### Backend

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| 500 error | Unhandled exception | Add try-catch |
| 401 error | Expired/invalid token | Refresh token flow |
| 403 error | Missing permission | Check authorization |
| 404 error | Wrong route/ID | Verify URL params |
| Slow query | Missing index | Add database index |
| Memory leak | Unclosed connections | Proper cleanup |

## Debugging Checklist

### Before Starting
- [ ] Reproduction steps documented
- [ ] Environment identified
- [ ] Recent changes reviewed

### During Investigation
- [ ] Logs checked
- [ ] Minimal reproduction created
- [ ] Root cause identified
- [ ] Fix location pinpointed

### After Fix
- [ ] Fix verified locally
- [ ] Regression test added
- [ ] All tests passing
- [ ] No new warnings/errors
- [ ] Documentation updated (if needed)

## Emergency Debugging

### Production Issues

```bash
# 1. Check Sentry immediately
# https://sentry.io/organizations/kaarplus/issues/

# 2. Check logs
kubectl logs -f deployment/api  # If using K8s
# or
tail -f /var/log/kaarplus/api.log

# 3. Enable debug logging
LOG_LEVEL=debug npm start

# 4. Database check
# Connect to production read replica
```

### Quick Rollback
```bash
# If fix is taking too long
git log --oneline -10  # Find last good commit
git revert HEAD         # Revert last commit
git push

# Or deploy previous version
npm run deploy:production -- --version=previous
```

## Post-Debug Actions

1. **Document the bug** - What caused it, how was it fixed
2. **Add regression test** - Prevent recurrence
3. **Update monitoring** - Alert if similar occurs
4. **Share learnings** - Team retrospective
5. **Improve process** - Prevent similar bugs
