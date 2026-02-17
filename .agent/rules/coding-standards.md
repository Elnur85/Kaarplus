---
title: Coding Standards
description: Mandatory coding standards for TypeScript, React, and Express code in the Kaarplus monorepo. Enforces naming conventions, file organization, and code quality rules.
triggers:
  - "*.ts"
  - "*.tsx"
  - "*.js"
  - "*.jsx"
---

# Coding Standards

## Universal Rules (ALL CODE)

### TypeScript Standards
- **Strict mode enabled everywhere** - no `any` types without explicit justification
- Use `interface` for object shapes, `type` for unions/intersections
- **Named exports only** - NO default exports allowed
- Async/await over raw promises
- All API responses typed with shared interfaces
- Descriptive variable names, JSDoc for complex functions
- Use `satisfies` keyword for type-safe object literals

### Naming Conventions
| Item | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `VehicleCard.tsx` |
| Utilities/Hooks | camelCase | `useFilterStore.ts` |
| Files | kebab-case for pages | `forgot-password/page.tsx` |
| Constants | UPPER_SNAKE_CASE | `MAX_LISTINGS = 5` |
| Types/Interfaces | PascalCase | `interface ListingQuery` |
| Enums | PascalCase | `enum ListingStatus` |
| Database models | PascalCase | `model User` |

### File Organization
```
component-name/
├── index.tsx          # Main component (named export)
├── types.ts           # Component-specific types
├── utils.ts           # Helper functions
└── *.test.tsx         # Colocated tests
```

### Import Order (ESLint enforced)
```typescript
// 1. Built-in
import path from 'path';

// 2. External
import { Request, Response } from 'express';
import { z } from 'zod';

// 3. Internal (@/ aliases)
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// 4. Parent/Sibling
import { VehicleCard } from '../vehicle-card';
import { useLocalStore } from './store';
```

## Frontend (Next.js + React)

### Component Rules
1. **Server Components by default** - add `"use client"` ONLY when:
   - Using hooks (useState, useEffect, etc.)
   - Browser APIs (window, document, localStorage)
   - Event handlers (onClick, onSubmit)
   - Client-side libraries

2. **Functional components only** - no class components
3. **Colocate component types** in the same file
4. **Use Shadcn/ui components** - never build custom UI primitives
5. **Named exports only** - `export function ComponentName()`

### Styling Standards
- Tailwind CSS utility classes only (no custom CSS unless absolutely necessary)
- Use `cn()` utility for conditional classes
- CSS variable tokens only - never hardcode hex colors:
  - ✅ `text-primary`, `bg-background`, `border-border`
  - ❌ `text-[#333]`, `bg-white`
- Desktop-first responsive design (matches Figma)

### Form Handling
- React Hook Form + Zod validation
- Shared schemas in `src/schemas/`
- Error messages in i18n files

### State Management
- **Zustand** for client state (filters, favorites, compare)
- Server state via API calls in Server Components
- URL state for shareable filters

## Backend (Express + TypeScript)

### Architecture Pattern
```
Route → Middleware → Controller → Service → Database
```

### Route Rules
- RESTful endpoints under `/api/`
- All routes authenticated by default
- Explicitly mark `[Public]` routes
- Zod schemas for ALL request validation

### Response Format
```typescript
// Success
{ data: T, meta?: { page, pageSize, total } }

// Error
{ error: string, details?: unknown }
```

### Middleware Pipeline
```
CORS → Rate Limit → Auth → Validation → Controller → Service
```

### Service Layer Rules
- Business logic ONLY in services
- Controllers handle HTTP concerns only
- Services throw custom errors (BadRequestError, NotFoundError, etc.)
- Error handler middleware catches all errors

### Database Rules
- Use Prisma ORM - no raw SQL without justification
- Always create migrations (never `db push` in production)
- Use `cuid()` for all primary keys
- Index frequently queried columns
- JSONB for flexible metadata

## Testing Standards

### Unit Tests (Vitest)
- Colocated `*.test.ts` files
- Test business logic, not implementation details
- Mock external dependencies

### E2E Tests (Playwright)
- Located in `e2e/` directory
- Test critical user flows
- Use data-testid for selectors

### Test Naming
- `describe('ComponentName', () => { ... })`
- `it('should do something when condition', () => { ... })`

## Code Quality Checklist

Before committing code:
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] No `console.log` statements (use logger utility)
- [ ] No `debugger` statements
- [ ] Proper error handling
- [ ] JSDoc for public functions
- [ ] i18n strings extracted (frontend)

## Forbidden Patterns

```typescript
// ❌ NO default exports
export default function Component() { }

// ❌ NO 'any' types
function process(data: any) { }

// ❌ NO console.log in production
console.log('debug');

// ❌ NO hardcoded colors
<div className="text-[#333] bg-white">

// ❌ NO raw promises without catch
fetch('/api').then(data => setData(data));

// ❌ NO magic numbers
if (count > 5) { } // Use constant: MAX_LISTINGS

// ❌ NO implicit returns for complex functions
const process = (x) => x.map(y => y.z); // Hard to debug
```
