# P2-T03: Advanced Search Page

> **Phase:** 2 — Engagement Features
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T08, P1-T07
> **Estimated Time:** 4 hours

## Objective

Implement a dedicated advanced search page that allows users to filter vehicles by highly specific criteria (power, mileage, drive type, etc.) and extend the API to support these filters.

## Scope

### 1. API Extensions

Extend the existing listings/search API to support additional advanced filters:

- **Mileage Range:** `mileageMin`, `mileageMax` (number)
- **Power Range:** `powerMin`, `powerMax` (number, kW)
- **Drive Type:** `driveType` (FWD, RWD, AWD, etc.)
- **Exterior:** `color` (string), `doors` (number), `seats` (number)
- **Condition:** `condition` (new, used, certified)
- **Location:** `location` (city/region)

**Files to Modify:**
- `apps/api/src/schemas/listing.ts` (listingQuerySchema)
- `apps/api/src/services/listingService.ts` (ListingQuery interface & getAllListings logic)

### 2. Advanced Search Page (Web)

The page `/search` should be the entry point for advanced filtering.

- **URL:** `/search`
- **Component:** `apps/web/src/app/(public)/search/page.tsx`
- **Filter Component:** `apps/web/src/components/search/advanced-filters.tsx`

**Requirements:**
- Sidebar with all advanced filter categories grouped in accordions.
- Active filter badges display for all active filters.
- Real-time updates (or manual "Show results" button depending on UX).
- Results displayed in grid/list view (sharing components with `/listings`).
- URL synchronization for all advanced filters.

### 3. Shared Component Updates

Ensure shared components support the new filter fields:
- `useFilterStore` (Zustand) must include the new fields.
- `FilterBadges` should handle the new fields.
- `UrlSync` should handle the new fields.

## Acceptance Criteria

- [ ] API supports all advanced filter parameters
- [ ] `/search` page displays correct results for combined filters
- [ ] URL remains in sync with all advanced filter states
- [ ] Desktop sidebar is sticky and scrolls independently
- [ ] Mobile filters are accessible via a slide-out Sheet
- [ ] "Reset filters" functionality clears all advanced states
- [ ] Proper loading states (skeletons) during fetch
- [ ] No results state with "Clear filters" action
