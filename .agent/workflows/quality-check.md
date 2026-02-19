---
description: Run all quality checks (lint, typecheck, test, build) with Kaarplus-specific validations
title: Quality Check Workflow
---

# Quality Check Workflow

Run this workflow after making code changes to ensure everything passes.

---

## Phase 1: Standard Quality Checks

### 1. Run the linter

```bash
npm run lint --workspaces --if-present
```

**What it checks:**
- ESLint rules across all workspaces
- Import order
- No unused variables
- No console.log statements
- React hooks rules

**If failures:**
```bash
npm run lint:fix  # Auto-fix what can be fixed
```

### 2. Run TypeScript type checking

```bash
npm run typecheck --workspaces --if-present
```

**What it checks:**
- Type errors in all TypeScript files
- Missing properties
- Incorrect types
- Prisma client types match schema

### 3. Run unit tests

```bash
npm run test --workspaces --if-present
```

**What it checks:**
- Business logic
- API routes
- Utility functions
- Component behavior

### 4. Attempt a production build

```bash
npm run build --workspaces --if-present
```

**What it checks:**
- Next.js can build successfully
- No SSR issues
- All imports resolve
- Environment variables present

---

## Phase 2: Kaarplus-Specific Quality Checks

### 5. Translation Key Completeness Check

**Verify all translation keys exist in all three languages:**

```bash
# List all translation namespaces
ls apps/web/messages/et/

# Check for missing keys (manual review)
diff apps/web/messages/et/common.json apps/web/messages/en/common.json
diff apps/web/messages/et/common.json apps/web/messages/ru/common.json
```

**What to check:**
- Every `t('key')` in code has matching key in all 3 JSON files
- No hardcoded strings in components
- Error messages have translations
- Button labels have translations

**Common issues:**
```typescript
// ❌ Missing translation
<button>Submit</button>
<span>Error occurred</span>

// ✅ Correct
<button>{t('actions.submit')}</button>
<span>{t('errors.unknown')}</span>
```

### 6. Hardcoded Data Check

**Verify no hardcoded domain data:**

```bash
# Search for suspicious hardcoded arrays
grep -r "\['Toyota', 'BMW'\]" apps/web/src
grep -r "\"Sedan\"" apps/web/src --include="*.tsx"

# Check for hardcoded colors (should use CSS variables)
grep -r "#10b77f" apps/web/src --include="*.tsx"
grep -r "text-\[#" apps/web/src --include="*.tsx"
```

**What to check:**
- No hardcoded makes/models (use API)
- No hardcoded colors (use `bg-primary`, `text-primary`)
- No hardcoded URLs (use env vars)
- No hardcoded limits (use config)

### 7. Three-State UI Check

**Verify every async component handles all three states:**

```typescript
// Every data-fetching component must have:

// 1. Loading state
if (isLoading) return <Skeleton />;

// 2. Error state  
if (error) return <ErrorState message={error.message} retry={refetch} />;

// 3. Empty state
if (!data?.length) return <EmptyState message={t('listings.noResults')} />;

// 4. Success state
return <DataDisplay data={data} />;
```

**Checklist for components:**
- [ ] Loading skeleton or spinner
- [ ] Error message with retry action
- [ ] Empty state illustration/message
- [ ] Success data display

### 8. API Error Handling Check

**Verify error handling follows pattern:**

```typescript
// ❌ Missing error handling
try {
  await api.post('/listings', data);
} catch (e) {
  // Silent
}

// ✅ Proper error handling
try {
  await api.post('/listings', data);
} catch (err) {
  if (err instanceof ApiError) {
    logger.error('Failed to create listing', { code: err.code, message: err.message });
    setError(err.message);
  } else {
    setError(t('errors.unknown'));
  }
}
```

### 9. Security Check

**Verify security rules are followed:**

```bash
# Check for console.log in production code
grep -r "console.log" apps/api/src --include="*.ts" | grep -v ".test.ts"

# Check for any types
grep -r ": any" apps/api/src --include="*.ts" | grep -v ".test.ts"
grep -r ": any" apps/web/src --include="*.ts" --include="*.tsx" | grep -v ".test."

# Check for default exports (forbidden)
grep -r "export default" apps/api/src --include="*.ts" | grep -v ".test.ts"
grep -r "export default" apps/web/src --include="*.ts" --include="*.tsx" | grep -v ".test."
```

### 10. Component Pattern Check

**Verify component patterns:**

```typescript
// ✅ Named export
export function ComponentName() { }

// ❌ Default export
export default function ComponentName() { }

// ✅ Server Component by default
export function ServerComponent() { }

// ✅ Client Component only when needed
"use client";
export function ClientComponent() { 
  useEffect(() => { }, []);
}
```

---

## Quality Check Summary

After running all checks, report:

```
## Quality Check Results

### Standard Checks
- [ ] Lint: PASSED / FAILED
- [ ] TypeScript: PASSED / FAILED  
- [ ] Unit Tests: PASSED / FAILED (X/Y passed)
- [ ] Build: PASSED / FAILED

### Kaarplus-Specific Checks
- [ ] Translation completeness: VERIFIED / ISSUES FOUND
- [ ] No hardcoded data: VERIFIED / ISSUES FOUND
- [ ] Three-state UI: VERIFIED / ISSUES FOUND
- [ ] Error handling: VERIFIED / ISSUES FOUND
- [ ] Security: VERIFIED / ISSUES FOUND
- [ ] Component patterns: VERIFIED / ISSUES FOUND

### Issues Found
1. [Description] - [Action taken]
2. [Description] - [Action taken]

### Ready for commit: YES / NO
```

---

## Pre-Commit Checklist

Before committing code:

```markdown
## Pre-Commit Checklist

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] No `console.log` statements (use logger utility)
- [ ] No `debugger` statements
- [ ] No `any` types
- [ ] Named exports only

### Functionality
- [ ] Feature works as expected
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Empty states implemented

### i18n
- [ ] All strings use translation keys
- [ ] Keys exist in et.json
- [ ] Keys exist in en.json
- [ ] Keys exist in ru.json

### Testing
- [ ] Unit tests added/updated
- [ ] Tests pass
- [ ] Manual testing completed

### Documentation
- [ ] Complex functions have JSDoc
- [ ] README updated if needed
- [ ] API.md updated if endpoints changed
```

---

## Automated Quality Gates

These run in CI/CD:

```yaml
# .github/workflows/ci.yml
code_quality:
  steps:
    - name: Lint
      run: npm run lint
    
    - name: Type Check
      run: npm run typecheck
    
    - name: Unit Tests
      run: npm run test
    
    - name: Build
      run: npm run build
```

**All gates must pass before merge.**

---

**Last Updated:** 2026-02-19
