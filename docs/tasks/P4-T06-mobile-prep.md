# P4-T06: Mobile App Preparation (Investor Screens)

> **Phase:** 4 — Polish & Scale
> **Status:** ✅ Complete
> **Dependencies:** Phase 1 (API)
> **Estimated Time:** 3 hours

## Objective

Prepare the ecosystem for a future mobile application. This involves ensuring the API is mobile-friendly (proper JSON responses, auth handling) and creating a specialized "Mobile App Teaser" page to showcase the upcoming app to investors and users.

## Requirements

### 1. API Audit & Readiness
- [ ] Verify Authentication endpoints work with standard JSON bodies (not just form-data).
- [ ] Ensure `POST /api/auth/login` returns a clean JWT and User object.
- [ ] Ensure `GET /api/user/profile` exists and returns full user details for the mobile profile screen.
- [ ] Create a specific endpoint `GET /api/mobile/version` to handle version checks/force updates in the future.

### 2. Mobile App Landing Page (`/app`)
- [ ] Create a new page `src/app/(public)/app/page.tsx`.
- [ ] Design a "Coming Soon" styling with "Investor Preview" badge.
- [ ] Display high-fidelity mockups of the mobile app (Home, Listings, Seller Mode).
- [ ] Add "Join Waitlist" form (integrating with existing Newsletter or new list).

### 3. Investor Resources (Seed Data)
- [ ] Ensure `db:seed` creates a "Demo User" with populated data (Chats, Favorites, Listings) so the API returns rich data immediately for demos.

## Technical Details

-   **Page Path**: `/app`
-   **API Path**: `/api/mobile/*`
-   **Design**: sleek, convincing mockups (using placeholders or generated images).

## Acceptance Criteria

- [ ] `GET /api/mobile/version` returns JSON with `minVersion`, `latestVersion`.
- [ ] Auth API verified working with Postman/cURL (standard JSON login).
- [ ] `/app` page is accessible and looks premium.
- [ ] "Join Waitlist" form functions (logs to console or saves to DB).
