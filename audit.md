**1. Executive Summary**
Kaarplus is a real monorepo marketplace, not a skeleton: browsing, listing creation, favorites, messaging, dealerships, reviews, GDPR, admin moderation, ads, and inspections all exist in code. The current maturity is “feature-rich beta with significant drift”: many core vertical slices are present, but there is visible product debt, stale docs, dead branches, duplicate files, and several UI promises that do not resolve to real routes or real backend behavior.

Overall health: medium. Core marketplace flows are mostly there; project hygiene is not. The biggest problems are drift and false confidence, not total absence of product.

Top 5 findings:
- The frontend/backend are substantially more complete than `docs/FEATURE_STATUS.md` claims, but the docs are stale in important places, e.g. admin user role update/delete exists in [admin.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/api/src/routes/admin.ts) and [admin/users/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/admin/users/page.tsx).
- Payments are still effectively dead: [payments.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/api/src/routes/payments.ts) exists but is not mounted in [routes/index.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/api/src/routes/index.ts), and [paymentController.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/api/src/controllers/paymentController.ts) returns `501`.
- The codebase violates its own rules in multiple places: hardcoded domain data in [constants.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/lib/constants.ts), hardcoded body-type taxonomies in [body-types.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/lib/body-types.ts) and [bodyTypes.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/api/src/utils/bodyTypes.ts), hardcoded filter exclusion `"Baku"` in [searchService.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/api/src/services/searchService.ts), and many user-facing strings outside i18n.
- The web workspace is cluttered with duplicate files/directories (`.next 2`, `.next 3`, `next.config 2.mjs`, `tsconfig 2.json`, etc.), and `npm run typecheck` currently fails partly because `.next` duplicate type files are included by [tsconfig.json](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/tsconfig.json).
- Several UI paths are misleadingly present but broken or missing: `/dashboard/listings/:id/edit`, `/admin/settings`, `/listings/:id/purchase*`, `/auth/login`, social login buttons, and the public placeholder pages.

**2. Architecture Reconstruction**
Monorepo: `apps/web` Next.js 15 app router, `apps/api` Express API, `packages/database` Prisma client/schema. `packages/ui` exists but appears effectively unused. `apps/web/src/store/*` is the active Zustand store location; `apps/web/src/lib/stores/*` is dead legacy duplication.

Frontend: App Router with public/auth/legal/admin/dashboard groups. Mixed SSR and client pages. Auth is awkwardly dual-layered: NextAuth session in [auth.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/auth.ts) plus backend JWT cookie auth. Rewrites send `/api/v1/*` to backend `/api/*` in [next.config.mjs](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/next.config.mjs).

Backend: Express app in [app.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/api/src/app.ts) mounts `/api/*`, global helmet/cors/rate limiting, cookie auth, and Socket.io. Mounted routers are auth, listings, search, user, admin, webhooks, uploads, dealerships, mobile, newsletter, reviews, content-blocks. Payments router is defined but unmounted.

Database/Prisma: main active models are `User`, `Listing`, `ListingImage`, `Favorite`, `Message`, `SavedSearch`, `Review`, `VehicleInspection`, `GdprConsent`, newsletter, ad models. Dead-ish or unused-in-practice models/fields: `Payment`, `Session`, `emailVerified`, `SavedSearch.lastNotified`, probably `User.dealershipId`.

Main data flows:
- Listings/search: `Listing` -> listing/search services -> `/api/listings|/api/search` -> listing/search pages.
- Sell flow: sell wizard -> `POST /listings` -> upload -> `POST /listings/:id/images` -> admin approval.
- Messaging/favorites/reviews/inspections/dashboard all use authenticated `/api/user/*` or `/api/reviews/*`.
- Ads: `AdCampaign`/`Advertisement`/`AdUnit` -> `/api/content-blocks/*` -> `AdSlot`.

Key conventions actually used:
- `/api/v1` rewrite for browser calls.
- Zustand for UI state.
- React-i18next namespaces.
- Prisma service layer on API.
- Admin/support role protection in API.

Docs divergences:
- `FEATURE_STATUS.md` understates implementation.
- `DATABASE.md` says `SavedSearch.alertsEnabled`; schema/code use `emailAlerts`.
- `FEATURE_STATUS.md` says no `emailVerified` column; schema has one.
- `ARCHITECTURE.md` and filesystem differ on store locations and missing/extra files.

**3. Feature State Audit**
| Domain | Status | Audit |
|---|---|---|
| auth | IMPLEMENTED | DB `User`/`PasswordResetToken`; API auth routes complete; frontend login/register/reset exist; wired end-to-end. Misleading UI: Google/Facebook buttons are present but inert. |
| listings | IMPLEMENTED | DB `Listing`/`ListingImage`; API CRUD + similar + contact + metadata; frontend listings/detail/home slices exist; admin approval makes public browse only `ACTIVE`. |
| sell wizard | IMPLEMENTED | DB writes listing + images + contact fields; API create/upload/attach wired; frontend 4-step wizard works. Misleading UI: edit links exist but edit route does not. |
| search and filters | PARTIAL | API filters are broad; frontend listings/search pages are rich; end-to-end works. Violations: hardcoded taxonomies/constants, hardcoded `Baku` exclusion, duplicate `/cars` and `/listings`. |
| favorites | IMPLEMENTED | DB `Favorite`; API CRUD + ids; frontend cards/dashboard wired. |
| messaging | IMPLEMENTED | DB `Message`; API conversations/thread/send/unread/mark-read; socket layer exists; dashboard UI wired. |
| dashboard | PARTIAL | Stats, favorites, messages, saved searches, inspections, settings work; listings table works. Misleading UI: edit route missing. |
| admin | PARTIAL | API moderation/users/analytics/ads/inspections exist. Frontend has overview, listings, users, analytics, ads. Misleading UI: `/admin/settings` nav target missing; page auth blocks `SUPPORT` on frontend while API allows it. |
| dealerships | IMPLEMENTED | DB uses `User.role=DEALERSHIP`; API list/detail/contact; frontend list/detail/contact wired. |
| reviews | IMPLEMENTED | DB `Review`; API stats/list/create/delete/featured; listing detail shows reviews for dealerships. |
| inspections | PARTIAL | DB/API buyer requests + dashboard list + admin status updates exist. Public `/inspections` page is fake placeholder; request dialog price `79.00 €` is hardcoded. |
| newsletter | IMPLEMENTED | DB `Newsletter`; API subscribe/unsubscribe; frontend shared signup and unsubscribe page wired. |
| GDPR | IMPLEMENTED | DB `GdprConsent`; API consent/export/delete; settings UI wired. |
| uploads | IMPLEMENTED | API local upload + presign; sell wizard uses both flows. |
| ads / campaigns / sponsored listings | IMPLEMENTED | DB ad models; API content blocks + admin CRUD/analytics + sponsored injection; frontend `AdSlot` and admin ads pages wired. |
| payments | BROKEN | DB `Payment` exists; webhook exists but inert; payment route unmounted; checkout components exist but are orphaned and call wrong path. |
| static/legal pages | PARTIAL | privacy/terms/cookies are real; FAQ is real but hardcoded Estonian; about/contact/careers/help/safety/fraud/sitemap/inspections are placeholders. |

**4. Route and Endpoint Audit**
Major mounted API surfaces: `/api/health`, `/api/auth/*`, `/api/listings/*`, `/api/search/*`, `/api/user/*`, `/api/admin/*`, `/api/webhooks/stripe`, `/api/uploads*`, `/api/dealerships*`, `/api/mobile/version`, `/api/newsletter/*`, `/api/reviews*`, `/api/content-blocks/*`.

Dead/unused/unreachable:
- `/api/payments/create-intent` is unreachable because router is not mounted.
- `CheckoutPageClient` and `CheckoutForm` are dead code; there are no purchase/checkout app routes.
- `/api/mobile/version` appears unused by frontend.
- Legacy stores in `apps/web/src/lib/stores/*` are unused.

Frontend references missing or inconsistent:
- `/dashboard/listings/${id}/edit` referenced in [my-listings-table.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/dashboard/my-listings-table.tsx), route absent.
- `/admin/settings` referenced in [admin/layout.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/admin/layout.tsx), route absent.
- `/auth/login` referenced in [request-inspection-button.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/inspections/request-inspection-button.tsx), route absent; actual route is `/login`.
- `/listings/:id/purchase` and `/purchase/success` referenced by checkout components, routes absent.

Shape mismatches/docs drift:
- API docs promise consistent `{ data, meta }`; auth routes return `{ user }`.
- Docs omit live admin user role/delete routes and inspection admin routes.
- Frontend uses both `/api/v1/*` rewrite and direct `${NEXT_PUBLIC_API_URL}/api/*` SSR fetches.

Auth/role protections:
- API: `requireAuth`, `requireRole`, listing ownership middleware.
- Admin API allows `ADMIN` and `SUPPORT`.
- Frontend admin page gate only admits `ADMIN`, so `SUPPORT` is blocked client-side.

**5. Frontend Audit**
Implemented pages: home, listings, listing detail, search, sell, dealers, dealer detail, dashboard sections, admin sections, legal pages, mobile app landing, newsletter unsubscribe.

Placeholder/under-construction: [about/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/(public)/about/page.tsx), [contact/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/(public)/contact/page.tsx), [careers/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/(public)/careers/page.tsx), [help/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/(public)/help/page.tsx), [safety/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/(public)/safety/page.tsx), [fraud/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/(public)/fraud/page.tsx), [sitemap/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/(public)/sitemap/page.tsx), [inspections/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/(public)/inspections/page.tsx).

Production-ready components: listing detail stack, sell wizard, dashboard settings, favorites/messages, dealership profile, ad slot, admin listing queue/analytics/users.

Clearly not production-ready:
- [faq/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/(legal)/faq/page.tsx): all hardcoded Estonian.
- [admin/users/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/admin/users/page.tsx), [admin/ads/[id]/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/admin/ads/[id]/page.tsx), [admin/ads/inventory/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/admin/ads/inventory/page.tsx): multiple hardcoded English strings.
- [request-inspection-button.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/inspections/request-inspection-button.tsx): fixed price `79.00 €`.
- [my-listings-table.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/dashboard/my-listings-table.tsx): placeholder image URL and dead edit links.
- [constants.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/lib/constants.ts): hardcoded makes/body/fuel/cities breaks “everything from DB”.

i18n gaps:
- Hardcoded pages/components above.
- `npm` script comparison shows missing locale plural keys in `messages/*/listings.json` and `messages/*/search.json`.
- Validation schemas like [sell-form.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/schemas/sell-form.ts) hardcode Estonian messages outside i18n.
- Some `defaultValue` fallbacks are carrying untranslated user text into UI.

**6. Database / Schema Audit**
Core active models: `User`, `Listing`, `ListingImage`, `Favorite`, `Message`, `SavedSearch`, `Review`, `VehicleInspection`, `GdprConsent`, `Newsletter`, ad models.

Dead or weakly used:
- `Payment`: schema only, no live creation/read flow.
- `Session`: present but backend auth is cookie JWT and NextAuth uses JWT strategy, so this looks unused.
- `emailVerified`: present, no verification workflow.
- `SavedSearch.lastNotified`: no scheduler or notifier uses it.

Risky constraints/design:
- Denormalized `favoriteCount` and `viewCount` can drift from actual relations.
- General-review uniqueness depends on service logic because nullable `listingId` weakens pure DB enforcement.
- `Listing.status=EXPIRED` exists but no expiration scheduler.
- Hardcoded domain logic still leaks into code despite schema support.

Migration concerns:
- Recent migration is listing contact fields, which aligns with sell/detail work.
- Schema/docs drift on saved search field naming.
- If duplicate workspace junk is committed long-term, type safety and CI reliability will keep degrading.

**7. Quality / Risk Audit**
- Type safety: failing web typecheck from duplicate generated files and broken test typings; frontend test setup is unhealthy.
- Error handling: repeated `catch {}` / `catch(console.error)` / silent swallow patterns in frontend and ad code, violating project rule.
- Validation: shared validation exists in places, but frontend and API schemas are duplicated and use hardcoded language messages.
- Security: admin delete is soft-delete only, but UI language says removal; support-role frontend mismatch can create authorization confusion.
- Performance: heavy client-side listings/search pages, duplicate `/cars` page, broad `findMany` calls, several fetches without abort/error discipline.
- UX: dead links, placeholder pages, inert social login, missing edit route, missing purchase route.
- Tests: web tests fail immediately because `@testing-library/dom` is missing; API service tests mostly run but some fail from stale mocks; API route tests are not usable in this sandbox because Supertest bind attempts hit `EPERM`.
- Docs drift: material and widespread.

**8. Where I Most Likely Left Off**
[High confidence] Most recent active areas were sell/listing contact info, listing detail, admin users, and related seller/contact surfaces. Evidence: latest migration adds listing contact fields; recently touched files include [sell-wizard.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/sell/sell-wizard.tsx), [listing-detail-view.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/car-detail/listing-detail-view.tsx), [admin/users/page.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/admin/users/page.tsx), [schemas/listing.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/api/src/schemas/listing.ts).

[Medium confidence] You were likely in a “seller/admin stabilization” phase, not a greenfield feature phase. The code shows a lot of almost-finished polish work: admin user management added, listing contact fields threaded through, public details improved, but dead links and docs were not cleaned up.

[Medium confidence] The likely abandoned branch is payments/checkout. There are full Stripe UI components, but no mounted route and no live API flow.

[High confidence] The likely next intended milestone was “make the existing marketplace credible end-to-end” rather than “add more domains”: fix admin/dashboard dead links, finish public inspections/static pages, and clean rule violations.

**9. Recommended Next Work**
Immediate next tasks:
1. Route honesty pass. Why: removes broken promises fastest. Dependencies: none. Files: [my-listings-table.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/dashboard/my-listings-table.tsx), [admin/layout.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/app/admin/layout.tsx), [request-inspection-button.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/inspections/request-inspection-button.tsx), checkout components. Risk: low. Verify: click every dashboard/admin/inspection CTA and ensure it resolves or is removed.
2. Hardcoded domain-data audit on sell/search/filter paths. Why: this is a direct project-rule violation. Dependencies: decide source-of-truth strategy. Files: [constants.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/lib/constants.ts), [step-2-vehicle-data.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/sell/step-2-vehicle-data.tsx), [advanced-filters.tsx](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/src/components/search/advanced-filters.tsx), [searchService.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/api/src/services/searchService.ts). Risk: medium. Verify: DB -> API -> UI option parity.
3. Docs reality sync. Why: current docs are misleading enough to cause wrong implementation decisions. Dependencies: audit accepted. Files: `docs/*.md`. Risk: low. Verify: every documented route/feature matches mounted code.

High-leverage stabilization tasks:
1. Clean workspace duplication and restore `typecheck`. Why: current `apps/web` duplicate files are poisoning signal. Dependencies: careful file cleanup. Files: [tsconfig.json](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/tsconfig.json) plus duplicate `* 2*` files/directories. Risk: medium. Verify: `npm run typecheck` passes or fails only on real code.
2. Repair web test environment. Why: tests currently fail before app logic due missing dependency/import shape. Dependencies: package/test config cleanup. Files: [apps/web/package.json](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/package.json), [vitest.config.ts](/Users/elnuraghabayli/Desktop/Kaarplus/apps/web/vitest.config.ts), `src/__tests__/*`. Risk: medium. Verify: web test suite executes real tests.
3. Unify i18n and string policy. Why: many user-facing strings are outside translation files. Dependencies: route honesty pass. Files: placeholder pages, admin pages, schemas, FAQ page. Risk: medium. Verify: grep for hardcoded UI strings drops sharply and locale parity script is clean.

Things not to touch yet:
1. Payments/checkout implementation. Why: surface exists but product flow is abandoned and backend contract is absent. Dependencies: product decision first. Risk: high. Verify later only after route and data model plan.
2. Deep schema refactors. Why: current issue is mostly wiring/drift, not schema insufficiency. Dependencies: rule/source-of-truth decisions first. Risk: high. Verify after feature stabilization.
3. Broad UI redesign. Why: current priority is honesty and completeness, not visual overhaul. Dependencies: functional cleanup first. Risk: medium. Verify after dead routes/placeholders are resolved.

**10. Ready-to-Use Handoff**
A. Best next implementation target: route honesty and broken-link cleanup across dashboard/admin/inspection/purchase surfaces.

B. Best next planning target: decide the canonical source for vehicle taxonomy/filter option data so sell/search/filter can stop hardcoding domain lists.

C. Best next cleanup/refactor target: remove duplicate `apps/web` artifact/config files and get web `typecheck` green again.

D. Questions the human should answer before coding:
- Is payments/checkout still in scope, or should all purchase UI be removed for now?
- Should `SUPPORT` have full frontend access to admin pages, matching the API?
- Do you want vehicle makes/body types/locations to come from DB tables, live listing-derived queries, or a managed config source?
- Should dashboard listing edit exist as a real route, or should edit CTAs be removed until implemented?
- Are placeholder public pages meant to ship soon, or should they be hidden from navigation/SEO?

Recommended next Codex prompt:
“Audit accepted. Do not add new features. First remove or fix all frontend routes and CTAs that point to missing pages (`/dashboard/listings/:id/edit`, `/admin/settings`, `/auth/login`, purchase routes), then clean the `apps/web` duplicate artifact/config files so `npm run typecheck` reflects real code issues. Verify with route checks and typecheck only.”