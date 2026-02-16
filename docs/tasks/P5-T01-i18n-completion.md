# P5-T01: i18n Completion — All Components Translated (et/en/ru)

> **Phase:** 5 — Production Readiness
> **Status:** ⬜ Not Started
> **Dependencies:** P4-T01
> **Estimated Time:** 8 hours
> **Priority:** CRITICAL — Blocks production launch

## Problem Statement

The i18n infrastructure (react-i18next, LanguageProvider, LanguageSwitcher) was set up in P4-T01, but only ~6 out of 60+ components actually use `useTranslation()`. The remaining components have hardcoded Estonian text. Switching languages in the UI only changes the header/footer and a few pages — the rest stays in Estonian.

## Current State

### Components Using `useTranslation()` (6):
- `login-form.tsx`
- `register-form.tsx`
- `hero-section.tsx`
- `header.tsx`
- `search-bar.tsx`
- `language-switcher.tsx`

### Translation Namespaces (5 exist, 14 missing):
- ✅ `common.json` — nav, footer, generic buttons
- ✅ `home.json` — landing page hero
- ✅ `listings.json` — listings page (partial)
- ✅ `auth.json` — login/register
- ✅ `errors.json` — error messages
- ❌ `sell.json` — sell wizard (steps 1-4)
- ❌ `dashboard.json` — dashboard overview, listings table, settings
- ❌ `admin.json` — listing queue, analytics, user management
- ❌ `carDetail.json` — specs-grid, price-card, gallery, features
- ❌ `checkout.json` — checkout form, order summary, payment
- ❌ `compare.json` — comparison page, add-vehicle sheet
- ❌ `reviews.json` — review list, write-review dialog
- ❌ `messages.json` — conversations, thread, compose
- ❌ `search.json` — advanced search page
- ❌ `favorites.json` — favorites page
- ❌ `inspection.json` — inspection request, status
- ❌ `legal.json` — privacy, terms, cookies, FAQ pages (or at least headings)
- ❌ `dealership.json` — dealer profile page
- ❌ `mobileApp.json` — mobile app teaser page

## Implementation Steps

### Step 1: Create Missing Translation Files (42 new files)
For each of the 14 missing namespaces, create `et/`, `en/`, and `ru/` JSON files:
```
messages/
├── et/
│   ├── sell.json
│   ├── dashboard.json
│   ├── admin.json
│   ├── carDetail.json
│   ├── checkout.json
│   ├── compare.json
│   ├── reviews.json
│   ├── messages.json
│   ├── search.json
│   ├── favorites.json
│   ├── inspection.json
│   ├── legal.json
│   ├── dealership.json
│   └── mobileApp.json
├── en/  (same 14 files)
└── ru/  (same 14 files)
```

### Step 2: Extract Strings from Components
For each component with hardcoded text:
1. Identify all user-facing strings
2. Create translation keys in the appropriate namespace
3. Add translations for all 3 languages (et, en, ru)

### Step 3: Refactor Components
For each component:
1. Import `useTranslation` from `react-i18next`
2. Initialize with correct namespace: `const { t } = useTranslation('sell')`
3. Replace every hardcoded string with `t('key')`
4. Handle interpolation for dynamic values: `t('price', { amount: price })`

### Step 4: Register Namespaces in i18n.ts
Update `src/i18n.ts` to import and register all new namespace files.

### Step 5: Verify
- Switch to each language and navigate every page
- Ensure no raw keys appear (`sell.step1.title` should never be visible)
- Ensure no hardcoded Estonian or English text remains

## Components to Refactor (Comprehensive List)

### Sell Wizard (~50 strings)
- `components/sell/sell-wizard.tsx`
- `components/sell/step-1-vehicle-type.tsx`
- `components/sell/step-2-vehicle-data.tsx`
- `components/sell/step-3-photo-upload.tsx`
- `components/sell/step-4-confirmation.tsx`

### Admin Panel (~40 strings)
- `components/admin/listing-queue.tsx`
- `components/admin/listing-review-card.tsx`
- `components/admin/analytics-dashboard.tsx`
- `components/admin/user-management.tsx` (if exists)
- `app/admin/page.tsx`
- `app/admin/layout.tsx`

### Dashboard (~30 strings)
- `components/dashboard/my-listings-table.tsx`
- `components/dashboard/dashboard-stats.tsx`
- `components/dashboard/settings-form.tsx` (if exists)
- `app/dashboard/page.tsx`
- `app/dashboard/layout.tsx`

### Car Detail (~25 strings)
- `components/car-detail/specs-grid.tsx`
- `components/car-detail/price-card.tsx`
- `components/car-detail/image-gallery.tsx`
- `components/car-detail/feature-badges.tsx`
- `components/car-detail/related-cars.tsx`
- `components/car-detail/contact-seller.tsx` (if exists)

### Listings Page (~20 strings)
- `components/listings/filter-sidebar.tsx`
- `components/listings/results-count.tsx`
- `components/listings/sort-select.tsx` (if exists)

### Checkout (~15 strings)
- `components/checkout/checkout-page-client.tsx`
- `components/checkout/checkout-form.tsx`

### Comparison (~10 strings)
- `components/comparison/compare-page-client.tsx`
- `components/comparison/add-vehicle-sheet.tsx`

### Reviews (~10 strings)
- `components/reviews/review-list.tsx`
- `components/reviews/write-review-dialog.tsx`

### Messages (~10 strings)
- `components/messages/messages-page-client.tsx`
- `components/messages/conversation-list.tsx`
- `components/messages/chat-thread.tsx` (if exists)

### Shared Components (~10 strings)
- `components/shared/newsletter-signup.tsx`
- `components/shared/vehicle-card.tsx`

### Other Pages
- `app/(public)/app/page.tsx` — mobile teaser (currently English!)
- `app/(legal)/*/page.tsx` — legal page titles
- `app/(public)/favorites/page.tsx`
- `app/(public)/search/page.tsx`

## Acceptance Criteria

- [ ] ALL 19 translation namespaces have JSON files for et, en, and ru (57 files total)
- [ ] ALL user-facing components use `useTranslation()` — ZERO hardcoded text
- [ ] Switching language updates ALL text visible on screen, on every page
- [ ] No translation keys visible to the user (no `sell.step1.title` in the UI)
- [ ] `date-fns` locale switches with language (not hardcoded to `et`)
- [ ] Currency formatting respects locale
- [ ] `i18n.ts` registers all namespaces
