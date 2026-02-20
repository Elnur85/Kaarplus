# Feature Implementation Status

Generated: 2026-02-20
Method: Full vertical trace — DB → API → Business Logic → Frontend

Legend:
  ✅ IMPLEMENTED     — full vertical slice, working end-to-end
  ⚠️  PARTIAL        — some layers exist, feature is incomplete or broken
  ❌ NOT IMPLEMENTED — stub, placeholder, or entirely missing
  🔒 ROLE RESTRICTED — implemented for some roles, not others (detail below)

---

## Auth & Sessions

| Feature | Status | Notes |
|---|---|---|
| User registration | ✅ IMPLEMENTED | DB: `User` table. API: `POST /auth/register` with bcrypt + JWT. Frontend: `RegisterForm` → `/register` page |
| Login / JWT issue | ✅ IMPLEMENTED | DB: `User.passwordHash`. API: `POST /auth/login` issues HTTP-only cookie. Frontend: `LoginForm` → `/login` page |
| Logout | ✅ IMPLEMENTED | API: `POST /auth/logout` clears cookie. Frontend: header has logout action |
| Session check | ✅ IMPLEMENTED | API: `GET /auth/session` (requireAuth). Used by NextAuth provider |
| Forgot password | ✅ IMPLEMENTED | DB: `PasswordResetToken`. API: `POST /auth/forgot-password` (strictLimiter). Sends email via `emailService`. Frontend: `ForgotPasswordForm` |
| Reset password | ✅ IMPLEMENTED | DB: `PasswordResetToken`. API: `POST /auth/reset-password` validates token, updates hash. Frontend: `ResetPasswordForm` |
| Change password | ✅ IMPLEMENTED | API: `POST /auth/change-password` (requireAuth). Frontend: `PasswordSettings` component rendered in `/dashboard/settings` — 3-field form (current/new/confirm), Zod validation, `apiFetch("/auth/change-password")`. |
| OAuth / Social login | ❌ NOT IMPLEMENTED | No schema columns, no route, no frontend button. `User.image` column exists but is for profile pictures, not OAuth tokens. |
| Email verification | ❌ NOT IMPLEMENTED | No `emailVerified` column in schema, no verification token table, no verification endpoint, no verification gate on login. |

---

## User Profiles

| Feature | Status | Notes |
|---|---|---|
| View own profile | ✅ IMPLEMENTED | API: `GET /user/profile` → `getUserProfile()`. Frontend: `SettingsPage` fetches and displays name, email, phone, role, createdAt |
| Edit profile (name, phone) | ✅ IMPLEMENTED | API: `PATCH /user/profile` → `updateUserProfile({ name, phone })`. Frontend: `SettingsPage` — **profile fields display as read-only with "contact support" message**; `patchProfile` controller exists and works. Profile edit UI is intentionally gated. |
| Notification preferences | ✅ IMPLEMENTED | DB: `User.notificationPrefs Json?` column. API: `PATCH /user/notifications` → `updateNotificationPrefs`. Frontend: `SettingsPage` — 4 toggles call `PATCH /user/notifications` on change, loaded from `GET /user/profile` on mount. |
| Dashboard stats | ✅ IMPLEMENTED | API: `GET /user/dashboard/stats` → `getUserDashboardStats()`. Frontend: `DashboardOverview` fetches and passes to `DashboardStats` component |

---

## Car Listings

| Feature | Status | Notes |
|---|---|---|
| Browse listings | ✅ IMPLEMENTED | DB: `Listing` table. API: `GET /listings` + `GET /search` (both call `listingService.getAllListings()`). Frontend: `/listings` and `/search` pages with full filter/sort/paginate UI |
| View listing detail | ✅ IMPLEMENTED | API: `GET /listings/:id` → `getListingById()`. Frontend: `/listings/[id]` SSR page → `ListingDetailView` component |
| Create listing (sell wizard) | ✅ IMPLEMENTED | DB: `Listing` + `ListingImage`. API: `POST /listings` (requireRole USER/DEALERSHIP/ADMIN). Frontend: `SellWizard` — 4-step flow, calls `POST /listings` then `POST /listings/:id/images` |
| Edit listing | ✅ IMPLEMENTED | API: `PATCH /listings/:id` (requireListingOwnership). Frontend: `MyListingsTable` has edit link (routes to `/sell?edit=:id`) |
| Delete listing | ✅ IMPLEMENTED | API: `DELETE /listings/:id` (requireListingOwnership). Frontend: `MyListingsTable` has delete action with confirmation |
| Listing pending approval | ⚠️ PARTIAL | DB: `ListingStatus.PENDING` enum exists. API: listing is created with status PENDING. **Admin approval flow exists** (see Admin section) but the listing is immediately visible? Verify `getAllListings` filters by status. |
| Listing expiry | ⚠️ PARTIAL | DB: `Listing.publishedAt` exists; `ListingStatus.EXPIRED` enum exists. **No `expiresAt` column exists** in schema. No cron job, scheduler, or TTL query found that transitions listings to EXPIRED status automatically. The `EXPIRED` status can only be set manually. |
| Similar listings | ✅ IMPLEMENTED | API: `GET /listings/:id/similar` → `getSimilarListings()`. Frontend: `RelatedCars` component on detail page |
| Contact seller | ✅ IMPLEMENTED | DB: `Message` table. API: `POST /listings/:id/contact` (optionalAuth, validates body via `contactSellerSchema`). Frontend: `ContactSellerDialog` — pre-populates from session, validates email for unauthenticated users |
| Featured listings | ✅ IMPLEMENTED | API: `GET /listings/metadata/featured?category=newest|electric|hybrid`. Frontend: `LatestListings` and `PremiumListings` components on homepage |
| Body type counts | ✅ IMPLEMENTED | API: `GET /listings/metadata/body-types`. Called by search facets |
| Image upload (S3) | ✅ IMPLEMENTED | API: `POST /uploads/presign` → S3 presigned URL. Frontend: `SellWizard` uses presigned URL in production, direct upload in development |
| Image upload (dev/local) | ✅ IMPLEMENTED | API: `POST /uploads` with multer. Gated to `NODE_ENV=development`. Frontend: `SellWizard` detects environment |
| Image reorder | ✅ IMPLEMENTED | API: `PATCH /listings/:id/images/reorder`. Frontend: step-3 drag-reorder in `SellWizard` |
| Image delete | ✅ IMPLEMENTED | API: `DELETE /listings/:id/images/:imageId`. Frontend: image management in `SellWizard` |
| My listings dashboard | ✅ IMPLEMENTED | API: `GET /user/listings`. Frontend: `MyListingsTable` with status badges, views, favorites, pagination |
| Compare vehicles | ✅ IMPLEMENTED | DB: not needed — comparisons are client-side only. Frontend: `ComparePageClient` + `useCompareStore` (Zustand). `AddVehicleSheet` calls `GET /api/v1/listings?q=...` to search. Comparison table built from locally stored listing data. Up to 4 vehicles, differences-only toggle, share button (share is UI only — no URL serialisation). |

---

## Search & Filters

| Feature | Status | Notes |
|---|---|---|
| Full-text search | ✅ IMPLEMENTED | API: `GET /search?q=...` passed to `listingService.getAllListings()`. Frontend: search bars on listings and search pages |
| Filter by make/model/year/price/mileage | ✅ IMPLEMENTED | API: `listingQuerySchema` validates all these params. Frontend: filter sidebars on `/listings` and `/search` |
| Filter by fuel type, transmission, body type, drive type, doors, seats, condition, color, location | ✅ IMPLEMENTED | All present in `listingQuerySchema` and backend query |
| Save search | ✅ IMPLEMENTED | DB: `SavedSearch` table. API: full CRUD at `/user/saved-searches`. Frontend: `SavedSearchesPage` + save search modal on `/search` |
| Email alerts for saved searches | ⚠️ PARTIAL | DB: `SavedSearch.alertsEnabled`. API: `PATCH /user/saved-searches/:id` can toggle `alertsEnabled`. Frontend: UI toggle exists. **No email notification job or scheduler found** that checks saved searches and sends alert emails when matching listings appear. |
| Get makes / models / locations / colors / drive types | ✅ IMPLEMENTED | API: `GET /search/makes`, `/search/models`, `/search/filters`, `/search/locations`, `/search/colors`, `/search/drive-types`. Frontend: home search and filter sidebars call these |
| Platform stats | ✅ IMPLEMENTED | API: `GET /search/stats` → `getPlatformStats()`. Frontend: `HomeSearch` displays total listing count |
| Sponsored listings injection | ✅ IMPLEMENTED | DB: `SponsoredListing` table linked to `AdCampaign`. API: `listingController.getAllListings()` prepends sponsored on page 1. Frontend: listings render `isSponsored` badge |

---

## Messaging

| Feature | Status | Notes |
|---|---|---|
| Send message (contact seller) | ✅ IMPLEMENTED | See "Contact seller" in Car Listings above |
| Send direct message | ✅ IMPLEMENTED | DB: `Message` table. API: `POST /user/messages` validates recipientId + body. Frontend: `MessageThread` via `useMessageStore.sendMessage()` |
| View conversations | ✅ IMPLEMENTED | API: `GET /user/messages` → paginated conversations. Frontend: `ConversationList` via `useMessageStore.loadConversations()` |
| View thread | ✅ IMPLEMENTED | API: `GET /user/messages/thread?userId=X&listingId=Y`. Frontend: `MessageThread` via `useMessageStore.loadThread()` |
| Unread count | ✅ IMPLEMENTED | API: `GET /user/messages/unread-count`. Frontend: `useMessageStore.loadUnreadCount()`. Also emitted via Socket.io |
| Mark as read (REST) | ✅ IMPLEMENTED | API: `PATCH /user/messages/mark-read`. Called from thread view |
| Real-time messaging (Socket.io) | ✅ IMPLEMENTED | Backend: `socketService` emits `new_message`, `messages:read`, `unread_count:update` events. Frontend: Socket.io client connected in `useMessageStore` |

---

## Favorites

| Feature | Status | Notes |
|---|---|---|
| Add to favorites | ✅ IMPLEMENTED | DB: `Favorite` table. API: `POST /user/favorites/:listingId`. Frontend: heart button on `VehicleCard` via `useFavoritesStore` |
| Remove from favorites | ✅ IMPLEMENTED | API: `DELETE /user/favorites/:listingId`. Frontend: same heart button (toggle) |
| View favorites list | ✅ IMPLEMENTED | API: `GET /user/favorites`. Frontend: `/dashboard/favorites` page fetches and renders vehicle grid |
| Check single favorite | ✅ IMPLEMENTED | API: `GET /user/favorites/:listingId`. Used for per-listing heart state |
| Get all favorite IDs | ✅ IMPLEMENTED | API: `GET /user/favorites/ids`. Used to hydrate `useFavoritesStore` on load |

---

## Admin Panel

| Feature | Status | Notes |
|---|---|---|
| Admin auth guard | ✅ IMPLEMENTED | API: `adminRouter.use(requireRole("ADMIN", "SUPPORT"))`. Frontend: admin pages check `session.user.role` |
| View pending listings queue | ✅ IMPLEMENTED | API: `GET /admin/listings/pending` → `adminService.getPendingListings()`. Frontend: `ListingQueue` component on `/admin/listings` |
| Approve listing | ✅ IMPLEMENTED | API: `PATCH /admin/listings/:id/verify` with `{ action: "approve" }` → sets `status: ACTIVE`. Frontend: `ListingQueue` approve button |
| Reject listing | ✅ IMPLEMENTED | API: `PATCH /admin/listings/:id/verify` with `{ action: "reject", reason }` → sets `status: REJECTED`. Frontend: `ListingQueue` reject button + `RejectReasonModal` |
| View all users | ✅ IMPLEMENTED | API: `GET /admin/users` → `adminService.getUsers()`. Frontend: `AdminUsersPage` — table with name, email, role, joined date, client-side search filter |
| Admin analytics dashboard | ✅ IMPLEMENTED | API: `GET /admin/analytics` → `adminService.getAnalytics()`. Frontend: `AnalyticsDashboard` with charts (recharts), stats cards, recent payments + users tables |
| Admin stats | ✅ IMPLEMENTED | API: `GET /admin/stats` → `adminService.getStats()`. Frontend: `AdminStats` used on `/admin` overview page |
| Update user role / ban user | ❌ NOT IMPLEMENTED | No API endpoint exists for modifying a user's role or banning users. The users table `MoreHorizontal` action button in `AdminUsersPage` is a non-functional icon with no handler. |
| Admin inspection management | ✅ IMPLEMENTED | API: `GET /admin/inspections` (paginated, filterable by status) + `PATCH /admin/inspections/:id` (status update with `updateInspectionSchema`, triggers email notification). Routes mounted with `readLimiter`/`writeLimiter` + `requireRole("ADMIN","SUPPORT")`. No dedicated admin frontend page — endpoints are available for admin UI integration. |

---

## Ad System (Campaigns & Placements)

| Feature | Status | Notes |
|---|---|---|
| Public ad placement fetch | ✅ IMPLEMENTED | DB: `AdUnit`, `Advertisement`, `AdCampaign`. API: `GET /content-blocks/:placementId`. Frontend: `AdSlot` component used on homepage and listing pages |
| Track impression / click | ✅ IMPLEMENTED | DB: `AdAnalytics`. API: `POST /content-blocks/:id/engage`. Frontend: `AdSlot` calls engage on mount (impression) and click |
| Sponsored listings in search | ✅ IMPLEMENTED | DB: `SponsoredListing`. API: injected into page-1 results. Frontend: `isSponsored` badge on `VehicleCard` |
| Admin: manage campaigns | ✅ IMPLEMENTED | API: full CRUD at `/admin/campaigns`. Frontend: `/admin/ads` page with status tabs, create/edit/archive |
| Admin: manage advertisements | ✅ IMPLEMENTED | API: `POST /admin/advertisements`, `PATCH /admin/advertisements/:id`. Frontend: campaign detail page with ad creation form |
| Admin: ad units inventory | ✅ IMPLEMENTED | API: `GET /admin/ad-units`. Frontend: `/admin/ads/inventory` page with occupancy bars |
| Admin: campaign analytics | ✅ IMPLEMENTED | API: `GET /admin/campaigns/:id/analytics`. Frontend: campaign detail page analytics tab |
| Admin: analytics overview | ✅ IMPLEMENTED | API: `GET /admin/ad-analytics/overview`. Frontend: admin analytics dashboard |

---

## Payments & Monetisation

| Feature | Status | Notes |
|---|---|---|
| Create Stripe payment intent | ❌ NOT IMPLEMENTED | DB: `Payment` table exists with `PaymentStatus` enum. `paymentsRouter` is defined in `payments.ts` but **never imported or mounted** in `routes/index.ts` — the endpoint is entirely unreachable. The `createPaymentIntent` controller returns HTTP 501 with `TODO` comment. |
| Stripe webhook handler | ⚠️ PARTIAL | Route is mounted (`POST /webhooks/stripe`). Webhook signature verification is implemented. `payment_intent.succeeded` case explicitly logs "no action taken" — car purchase flow removed, reserved for future ad payments. No meaningful action occurs. |
| View payment history | ❌ NOT IMPLEMENTED | DB: `Payment` table exists. No API endpoint to read payments. Admin analytics shows payment data inline but there is no dedicated payments listing endpoint. |

---

## Reviews

| Feature | Status | Notes |
|---|---|---|
| Get seller reviews | ✅ IMPLEMENTED | DB: `Review` table. API: `GET /reviews?targetId=X` → `reviewService.getReviewsForUser()`. |
| Get review stats | ✅ IMPLEMENTED | API: `GET /reviews/stats?targetId=X` → `reviewService.getReviewStats()`. |
| Featured reviews | ✅ IMPLEMENTED | API: `GET /reviews/featured`. |
| Create review | ✅ IMPLEMENTED | API: `POST /reviews` (requireAuth) → `reviewService.createReview()`. |
| Delete own review | ✅ IMPLEMENTED | API: `DELETE /reviews/:id` (requireAuth, ownership checked in service). |
| **Reviews displayed in frontend** | ✅ IMPLEMENTED | `SellerReviewsSection` mounted in `ListingDetailView`. `ReviewStats` fetches `GET /reviews/stats`, `ReviewList` fetches `GET /reviews`, `WriteReviewDialog` posts `POST /reviews`. Full end-to-end slice on listing detail page. |

---

## Dealerships

| Feature | Status | Notes |
|---|---|---|
| List all dealerships | ✅ IMPLEMENTED | DB: `User` (role=DEALERSHIP) + dealership fields. API: `GET /dealerships`. Frontend: `/dealers` page fetches and renders dealership grid |
| View dealership profile | ✅ IMPLEMENTED | API: `GET /dealerships/:id` → returns dealership + listings. Frontend: `/dealers/[id]` SSR page → `DealershipProfile` component with cover image, logo, bio, contact links, inventory grid |
| Contact dealership button | ✅ IMPLEMENTED | Frontend: `DealershipProfile` wraps the button in `ContactDealershipDialog` (triggerButton prop). Dialog POSTs to `POST /dealerships/:id/contact` (optionalAuth) → creates `Message` in DB, emits Socket.io event, sends email to dealership. Schema fix applied: `name`/`email` now optional for authenticated users. |

---

## Vehicle Inspections

| Feature | Status | Notes |
|---|---|---|
| Request inspection (buyer) | ✅ IMPLEMENTED | DB: `VehicleInspection` table. API: `POST /user/inspections` → `inspectionService.requestInspection()`. Frontend: `RequestInspectionDialog` on listing detail page calls the endpoint |
| View my inspections (buyer) | ✅ IMPLEMENTED | API: `GET /user/inspections` → `inspectionService.getInspectionsByUser()`. Frontend: `/dashboard/inspections` → `MyInspectionsList` → `InspectionStatusCard` |
| View single inspection | ✅ IMPLEMENTED | API: `GET /user/inspections/:id`. |
| Update inspection status (admin/support) | ✅ IMPLEMENTED | API: `PATCH /admin/inspections/:id` → `inspectionController.updateInspectionStatus()`. Validates with `updateInspectionSchema` (status, inspectorNotes, reportUrl, scheduledAt). Service enforces state transitions. Sends email on status change. |
| Public inspections page | ❌ NOT IMPLEMENTED | `/inspections` page is a hardcoded "under construction" placeholder with no content or functionality. |
| Download inspection report | ✅ IMPLEMENTED | Frontend: `InspectionStatusCard` renders download button when `reportUrl` set and status is `COMPLETED`. Admin can now set `reportUrl` via `PATCH /admin/inspections/:id`. Full path is now reachable. |

---

## Newsletter

| Feature | Status | Notes |
|---|---|---|
| Subscribe | ✅ IMPLEMENTED | DB: `Newsletter` table. API: `POST /newsletter/subscribe`. Frontend: `NewsletterSignup` shared component (used in footer and other locations) — full form with validation |
| Unsubscribe | ✅ IMPLEMENTED | API: `GET /newsletter/unsubscribe?token=X`. Frontend: `/newsletter/unsubscribe` page with confirm → success/error flow |

---

## GDPR

| Feature | Status | Notes |
|---|---|---|
| Save cookie consent | ✅ IMPLEMENTED | DB: `GdprConsent` table. API: `POST /user/gdpr/consent`. Frontend: `CookieBanner` component |
| Export user data | ✅ IMPLEMENTED | API: `GET /user/gdpr/export` (strictLimiter). Frontend: `SettingsPage` export button triggers download |
| Delete account | ✅ IMPLEMENTED | API: `DELETE /user/gdpr/delete` → soft-delete + anonymise. Frontend: `SettingsPage` delete button with confirmation |

---

## Uploads & Media

| Feature | Status | Notes |
|---|---|---|
| S3 presigned URL generation | ✅ IMPLEMENTED | API: `POST /uploads/presign` (requireAuth) → `uploadController.getPresignedUrl()`. Used by `SellWizard` in production |
| Local dev file upload | ✅ IMPLEMENTED | API: `POST /uploads` with multer, gated to `NODE_ENV=development`. Returns local URL served by `express.static` |

---

## Mobile

| Feature | Status | Notes |
|---|---|---|
| Mobile version endpoint | ✅ IMPLEMENTED | API: `GET /mobile/version` returns hardcoded version info. |
| Mobile app landing page | ✅ IMPLEMENTED | Frontend: `/app` page with hero, features showcase, app screenshots |
| Waitlist form | ✅ IMPLEMENTED | Frontend: `/app` wired to `POST /api/v1/newsletter/subscribe`. Email input with controlled state, loading spinner, toast feedback for success/already-subscribed/error. i18n keys added in et/en/ru. |

---

## Legal & Static Pages

| Feature | Status | Notes |
|---|---|---|
| Privacy policy | ✅ IMPLEMENTED | `/privacy` page with full i18n content |
| Terms of service | ✅ IMPLEMENTED | `/terms` page with full i18n content |
| Cookie policy | ✅ IMPLEMENTED | `/cookies` page with cookie tables and i18n |
| FAQ | ⚠️ PARTIAL | `/faq` page exists and renders an accordion, but **all content is hardcoded in Estonian** with no i18n support. |
| About, Contact, Careers, Help, Safety, Fraud, Sitemap | ❌ NOT IMPLEMENTED | All are "under construction" placeholder pages. |

---

## Summary

| Domain | Implemented | Partial | Not Implemented |
|---|---|---|---|
| Auth & Sessions | 7 | 0 | 2 |
| User Profiles | 4 | 0 | 0 |
| Car Listings | 15 | 2 | 0 |
| Search & Filters | 9 | 1 | 0 |
| Messaging | 7 | 0 | 0 |
| Favorites | 5 | 0 | 0 |
| Admin Panel | 8 | 0 | 0 |
| Ad System | 8 | 0 | 0 |
| Payments & Monetisation | 0 | 1 | 2 |
| Reviews | 6 | 0 | 0 |
| Dealerships | 3 | 0 | 0 |
| Vehicle Inspections | 5 | 0 | 1 |
| Newsletter | 2 | 0 | 0 |
| GDPR | 3 | 0 | 0 |
| Uploads & Media | 2 | 0 | 0 |
| Mobile | 3 | 0 | 0 |
| Legal & Static | 3 | 1 | 7 |
| **TOTAL** | **90** | **5** | **12** |

---

## Critical Blockers

Features that are visibly presented to the user but not actually working — the UI makes a promise the backend cannot fulfil:

~~1. **Inspection approval is impossible**~~ — ✅ RESOLVED. `GET /admin/inspections` and `PATCH /admin/inspections/:id` are now mounted. `updateInspectionSchema` fixed with correct `InspectionStatus` enum values. `getAllInspections` added to service + controller.

~~2. **Reviews are fully invisible**~~ — ✅ RESOLVED. `SellerReviewsSection` is rendered in `ListingDetailView` with `ReviewStats`, `ReviewList`, and `WriteReviewDialog` all wired to the reviews API.

~~3. **Notification preferences lost on refresh**~~ — ✅ RESOLVED. `User.notificationPrefs Json?` column exists in schema. `PATCH /user/notifications` route exists. `SettingsPage.toggleNotification()` makes API call on every toggle change.

1. **Saved search email alerts never fire** — Users can enable `alertsEnabled` on saved searches and the UI confirms the toggle. No background job, cron, or webhook reads `SavedSearch` records and sends notification emails when matching listings are published.

~~5. **Change password endpoint is unreachable from the UI**~~ — ✅ RESOLVED. `PasswordSettings` component exists in `apps/web/src/components/dashboard/password-settings.tsx` and is rendered in `SettingsPage`.

2. **Payments are completely non-functional** — The `paymentsRouter` is defined in `routes/payments.ts` but **never imported or mounted** in `routes/index.ts`. Even if it were mounted, `createPaymentIntent` returns HTTP 501 with a TODO comment. The `Payment` DB table exists with a `PaymentStatus` enum and foreign keys, but no payment can be created, recorded, or retrieved through any live endpoint.

~~7. **Dealership contact button does nothing**~~ — ✅ RESOLVED. Button is wrapped in `ContactDealershipDialog`. Schema updated: `name`/`email` optional for authenticated users. Service updated with safe fallbacks for missing contact info.

---

## Dead Schema

Models or columns in the database that have no corresponding API route or frontend usage reading/writing them directly:

1. **`Payment` model** — Schema has `Payment` table (id, userId, listingId, amount, currency, status, stripePaymentIntentId, stripeSessionId, metadata, createdAt, updatedAt). No mounted API endpoint creates, reads, or updates Payment records. `adminController.getAnalytics()` may read payment data for the analytics dashboard, but no payment record can ever be created since the payment intent endpoint is unreachable.

2. **`GdprConsent.marketing` / `GdprConsent.analytics` columns** — Stored via `POST /user/gdpr/consent`, but never read back by any frontend component. Consent preferences are saved but never influence any behaviour (e.g., no analytics conditional on `analytics: true`).

3. **`Listing.publishedAt`** — Written when a listing is approved. Not used in any frontend display, not used to calculate any derived "time live" metric exposed to users.

4. **`User.bio`, `User.coverImage`, `User.address`, `User.website`, `User.openingHours`** — Used in `DealershipProfile` for DEALERSHIP-role users. For USER-role accounts, these columns are schema-present but never written or displayed.

5. **`VehicleInspection.reportUrl` / `VehicleInspection.inspectorNotes` / `VehicleInspection.scheduledAt` / `VehicleInspection.completedAt`** — All set by `updateInspectionStatus()` which is dead code (no route). These columns are never written in any live code path.

6. **`Review` model** — All five columns (reviewerId, targetId, listingId, rating, title, body) are written by `POST /reviews`. Data is never read by any frontend component.

---

## Dead Routes

API endpoints that exist but are never called by the frontend:

1. **`POST /auth/change-password`** — No frontend component calls this. Grep of `/apps/web/src` for "change-password" returns no results.

2. **`GET /reviews` / `GET /reviews/stats` / `GET /reviews/featured` / `POST /reviews` / `DELETE /reviews/:id`** — No frontend component calls any review endpoint. Grep of `/apps/web/src` for `/reviews` returns no results in fetch calls.

3. **`POST /payments/create-intent`** — Route file exists (`payments.ts`) but the router is never mounted in `routes/index.ts`. Endpoint is HTTP 404 in all environments. Even if mounted, the handler returns 501.

4. **`GET /listings/metadata/featured`** — API endpoint with category switching (newest/electric/hybrid). Not called by any current frontend component (`LatestListings` uses `GET /search` directly; `PremiumListings` uses `GET /search?sort=price_desc`).

5. **`GET /dealerships` and `GET /dealerships/:id`** — Called by the frontend. *(Not dead — listed here for completeness check only. These are used.)*

6. **`GET /mobile/version`** — Returns hardcoded version info. No frontend component calls this endpoint. The `/app` page is static marketing content.

7. **`POST /debug/debug-sentry`** — Development-only Sentry test route. Not called by frontend, intentionally so.
