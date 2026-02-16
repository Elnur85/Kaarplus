# P5-T05: Bug Fixes & Broken Assets Cleanup

> **Phase:** 5 — Production Readiness
> **Status:** ⬜ Not Started
> **Dependencies:** Phase 1
> **Estimated Time:** 3 hours

## Problem Statement

Several runtime issues exist that affect user experience or developer confidence.

## Known Issues

### 1. Broken Unsplash Image URLs (404)
**Location:** Landing page hero section, seed data
**Symptom:** `upstream image response failed for https://images.unsplash.com/... 404`
**Fix:** Replace broken Unsplash photo IDs with valid ones or use local placeholder images.

Files to check:
- `components/landing/hero-section.tsx`
- `components/landing/featured-cars.tsx`
- `packages/database/prisma/seed.ts` (image URLs in seed data)

### 2. Deprecated `middleware.ts` Convention (Next.js 16)
**Location:** `apps/web/middleware.ts`
**Symptom:** `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
**Fix:** Migrate middleware to proxy convention per Next.js 16 docs.

### 3. Hardcoded `et` Locale in date-fns
**Location:** `components/car-detail/specs-grid.tsx`
**Symptom:** Dates always show in Estonian regardless of language setting
**Fix:** Use dynamic locale from i18n context

### 4. No Dark Mode CSS Variables
**Location:** `apps/web/src/app/globals.css`
**Symptom:** Only light theme defined; dark mode shows broken colors
**Fix:** Add `.dark` CSS variables (or explicitly disable dark mode in Tailwind config)

### 5. Missing `.env.example` Completeness
**Location:** `apps/api/src/.env.example`, `apps/web/.env.example`
**Symptom:** Not all required variables documented
**Fix:** Document every variable with descriptions

### 6. Console Warnings
- Stripe key not set warning on every API start
- Sentry DSN not set warning on every API start
**Fix:** Suppress warnings when in development mode, or provide clearer messaging

## Implementation Steps

### Image Fixes
1. Test each Unsplash URL manually
2. Replace broken URLs with verified working ones
3. Add `unoptimized` prop to external images that fail optimization

### Middleware Migration
1. Read Next.js 16 proxy docs
2. Convert `middleware.ts` to `proxy.ts` format
3. Verify auth protection still works

### Date Locale
1. Create a `useLocale()` hook or util that maps i18n language to date-fns locale
2. Use it in specs-grid.tsx and any other date formatting

### Dark Mode
Option A: Add dark mode variables to globals.css
Option B: Set `darkMode: 'class'` in tailwind config and add a toggle
Option C: Explicitly disable dark mode (set `@media (prefers-color-scheme: dark)` to use light colors)

### Environment Docs
1. List every env var used in the project
2. Add descriptions and example values
3. Mark which are required vs optional

## Acceptance Criteria

- [ ] Zero 404 image errors in console during normal browsing
- [ ] No deprecated middleware warning
- [ ] Dates format correctly in all 3 languages
- [ ] Dark mode either works correctly OR is explicitly disabled
- [ ] `.env.example` files are complete and documented
- [ ] Clean console output on `npm run dev` (no unexpected warnings)
