# P6-T02: Ad Engine: Full UI Integration & Dashboard

> **Phase:** 6 — Optimization & Hardening
> **Status:** ✅ Completed
> **Dependencies:** Phase 2, Phase 3
> **Estimated Time:** 5 hours

## Objective

Complete the implementation of the internal advertisement engine. This involves integrating ad slots into the actual UI (Listings page, Search page, Car Detail), creating an admin dashboard for campaign management, and implementing "Sponsored Listings" that appear at the top of search results.

## Requirements

### 1. Ad Slot Integration (Frontend)
- [ ] Add `AdSlot` to the Listings Page sidebar.
- [ ] Add `AdSlot` to the Search Page (inline between results).
- [ ] Add `AdSlot` to the Car Detail Page sidebar.
- [ ] Ensure `AdSlot` passes the correct context (fuel type, body type, make) for targeted ads.
- [ ] Verify that `fireEvent('IMPRESSION')` is triggered when an ad is 50% visible for 1 second.
- [ ] Verify that `fireEvent('CLICK')` is triggered when an ad is clicked.

### 2. Sponsored Listings
- [ ] Update `apps/api/src/controllers/searchController.ts` to fetch and prepend sponsored listings.
- [ ] Update `apps/web/src/app/(public)/search/page.tsx` to display a "Sponsored" badge on sponsored listings.

### 3. Admin Ad Dashboard (`/admin/ads`)
- [ ] Create `/apps/web/src/app/admin/ads/page.tsx` as the main ad management view.
- [ ] Implement a campaign list table.
- [ ] Create a "Create Campaign" form modal.
- [ ] Implement a Campaign Detail view with analytics charts (using the existing `getCampaignAnalytics` API).
- [ ] Add ability to Archive/Pause campaigns.

### 4. Media Handling
- [ ] Ensure ads can be uploaded and stored in S3 (reusing existing image upload infrastructure).

## Technical Details

- **Backend Service**: `apps/api/src/services/adService.ts`
- **Frontend Component**: `apps/web/src/components/shared/ad-slot.tsx`
- **API Routes**: `/api/content-blocks/*` and `/api/ads/*` (admin)
- **Design**: Follow the existing dashboard aesthetic for the admin part.

## Acceptance Criteria
- [ ] Ads are correctly displayed in the sidebar of listings and detail pages.
- [ ] Sponsored listings appear at the top of search results with a clear badge.
- [ ] Admin can create, edit, and track a campaign from start to finish.
- [ ] Clicking an ad redirects to the `linkUrl` and increments the click count in the database.
- [ ] Impessions are accurately tracked in `AdAnalytics` table.
