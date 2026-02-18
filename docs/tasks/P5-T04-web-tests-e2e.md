# P5-T04: Web Component Tests + E2E Fixes

> **Phase:** 5 — Production Readiness
> **Status:** ✅ Completed
> **Dependencies:** P5-T03
> **Estimated Time:** 5 hours

## Problem Statement

No React component tests exist. E2E suite has 1 skipped test (admin) and seller test is flaky.

## Implementation Steps

### Step 1: Web Component Tests

#### VehicleCard (`src/__tests__/components/vehicle-card.test.tsx`)
- Renders make/model/year/price correctly
- Formats price with Euro symbol
- Links to correct detail page
- Handles missing image gracefully
- Shows "New" badge when applicable

#### FilterSidebar (`src/__tests__/components/filter-sidebar.test.tsx`)
- Renders all filter categories
- Updates filters on selection
- Clears filters when reset clicked
- Shows active filter count

#### SellWizard (`src/__tests__/components/sell-wizard.test.tsx`)
- Step 1: vehicle type selection navigates to step 2
- Step 2: form validation (required fields)
- Step 3: photo upload zone renders
- Step 4: confirmation renders on success

#### LoginForm (`src/__tests__/components/login-form.test.tsx`)
- Renders email and password inputs
- Shows validation errors
- Submit button disabled during loading
- Translation keys render correctly

#### PriceDisplay (`src/__tests__/components/price-display.test.tsx`)
- Formats integer price (35900 → "35 900 €")
- Handles zero/null values
- Uses tabular-nums class

#### LanguageSwitcher (`src/__tests__/components/language-switcher.test.tsx`)
- Renders current language name
- Dropdown shows all 3 languages
- Switching updates i18n language
- Saves preference to localStorage

#### Pagination (`src/__tests__/components/pagination.test.tsx`)
- Renders correct page numbers
- Disables prev on first page
- Disables next on last page
- Calls onChange with correct page

### Step 2: Fix E2E Tests

#### Un-skip Admin Test (`e2e/admin.spec.ts`)
- Investigate why it was skipped (environment mocking issues)
- Fix the test or add proper test user setup
- Ensure admin login works in E2E environment

#### Fix Seller Test Flakiness (`e2e/seller.spec.ts`)
- Add proper wait conditions
- Use `page.waitForResponse()` for API calls
- Add retry logic for network-dependent steps

#### Add Missing E2E Flows
- `e2e/compare.spec.ts` — Add vehicles to comparison, verify table
- `e2e/favorites.spec.ts` — Toggle favorites, verify page
- `e2e/language.spec.ts` — Switch language, verify text changes

## Acceptance Criteria

- [ ] All listed component tests pass
- [ ] E2E admin test un-skipped and passing
- [ ] E2E seller test stable (no flaking)
- [ ] At least 2 new E2E specs added
- [ ] `npm run test:web` runs all component tests
- [ ] Full E2E suite green: `npx playwright test` — 0 failures
