# Kaarplus — Comprehensive Project Audit Report

> **Audit Date:** 2026-02-16
> **Auditor:** Antigravity AI
> **Verdict:** ❌ NOT Production-Ready — Significant gaps remain

---

## Executive Summary

The previous AI agent marked ALL 27 tasks as "✅ Complete" — this is **misleading**. While the project skeleton and API layer are reasonably functional, substantial gaps exist in:

1. **i18n (Internationalization)** — Only ~6 components use `useTranslation()`. The remaining 40+ components have hardcoded Estonian strings. Language switching exists but does nothing for 90% of the UI.
2. **Missing Translation Namespaces** — Only 5 JSON files per language (common, home, listings, auth, errors). Missing: dashboard, sell, admin, checkout, compare, reviews, messages, legal, search, inspection, car-detail, favorites, dealership, mobile-app.
3. **Unit/Integration Tests** — Zero. No test runner configured for apps/web or apps/api. Only 4 E2E tests exist (of which 1 is skipped).
4. **Stitch Design Fidelity** — 8 stitch reference designs exist but no systematic comparison was done to verify implementation accuracy.
5. **Build Warnings** — Unsplash image URLs returning 404, deprecated middleware convention.
6. **Error Handling Gaps** — Many components lack proper error boundaries and loading states.

---

## Section 1: i18n Audit — CRITICAL ❌

### Current State

| Area | Status | Notes |
|------|--------|-------|
| i18n library installed | ✅ | `react-i18next` |
| LanguageSwitcher UI | ✅ | Works in header |
| LanguageProvider wrapper | ✅ | In root layout |
| Translation JSON files | ⚠️ PARTIAL | Only 5 namespaces out of ~19 needed |
| Components using `useTranslation()` | ❌ 6 out of ~60+ | Only: login-form, register-form, hero-section, header, search-bar, language-switcher |

### Components with Hardcoded Strings (NOT Translated)

#### Sell Wizard (Estonian-only)
- `sell-wizard.tsx` — "Avalda kuulutus"
- `step-1-vehicle-type.tsx` — "Valige sõiduki tüüp"
- `step-2-vehicle-data.tsx` — ALL form labels (Mark, Mudel, Aasta, Hind, etc.)
- `step-3-photo-upload.tsx` — "Lisage fotod", tips text
- `step-4-confirmation.tsx` — ALL text ("Kuulutus on edukalt esitatud!", etc.)

#### Admin Panel (Estonian-only)
- `listing-queue.tsx` — "Kinnitamise järjekord", "Uuenda nimekirja", error messages
- `listing-review-card.tsx` — "Tehnilised andmed", buttons
- `analytics-dashboard.tsx` — "Viimased maksed", "Uued kasutajad", etc.
- `user-management.tsx` — Unknown, needs check

#### Dashboard (Estonian-only)
- `my-listings-table.tsx` — "Lisa kuulutus"
- Dashboard stats labels

#### Car Detail (Estonian-only)
- `specs-grid.tsx` — "Kuulutus lisatud:"
- `image-gallery.tsx` — "Pilte ei ole"
- `price-card.tsx` — "Osta kohe", "Turu keskmine", "Sinu võit"
- `related-cars.tsx` — "Sarnased kuulutused"
- `feature-badges.tsx` — "Lisavarustus märkimata"

#### Listings (Estonian-only)
- `filter-sidebar.tsx` — "Mark ja mudel", all filter labels
- `results-count.tsx` — "Kasutatud autod"
- Sort options, pagination text

#### Checkout (Estonian-only)
- `checkout-page-client.tsx` — "Turvaline maksmine", "Tellimuse kokkuvõte"
- `checkout-form.tsx` — "Turvaline makse krüpteeritud ühendusega"

#### Comparison (Estonian-only)
- `compare-page-client.tsx` — "Lisa sõiduk", "Sirvi kuulutusi"
- `add-vehicle-sheet.tsx` — "Lisa sõiduk võrdlusesse"

#### Messages (Estonian-only)
- `messages-page-client.tsx` — "Sisselogimine on vajalik..."
- `conversation-list.tsx` — "Sonumeid pole"

#### Reviews (Estonian-only)
- `review-list.tsx` — "Arvustusi pole veel"
- `write-review-dialog.tsx` — "Kirjuta arvustus"

#### Mobile App Page (English-only)
- `app/page.tsx` — All text in English (inconsistent)

### Translation Namespaces Needed (currently only 5 exist)

| Namespace | Exists? | Components Needing It |
|-----------|---------|----------------------|
| `common` | ✅ | nav, footer, generic buttons |
| `home` | ✅ | landing page |
| `listings` | ✅ | listings page (partial) |
| `auth` | ✅ | login, register |
| `errors` | ✅ | error messages |
| `sell` | ❌ MISSING | sell-wizard steps 1-4 |
| `dashboard` | ❌ MISSING | dashboard overview, listings table, settings |
| `admin` | ❌ MISSING | listing queue, analytics, user management |
| `carDetail` | ❌ MISSING | specs-grid, price-card, gallery, features |
| `checkout` | ❌ MISSING | checkout form, order summary |
| `compare` | ❌ MISSING | comparison page, add-vehicle sheet |
| `reviews` | ❌ MISSING | review list, write-review dialog |
| `messages` | ❌ MISSING | conversations, thread, compose |
| `search` | ❌ MISSING | advanced search page |
| `favorites` | ❌ MISSING | favorites page |
| `inspection` | ❌ MISSING | inspection request, status |
| `legal` | ❌ MISSING | privacy, terms, cookies, FAQ pages |
| `dealership` | ❌ MISSING | dealer profile page |
| `mobileApp` | ❌ MISSING | mobile app teaser page |

---

## Section 2: Testing Audit — CRITICAL ❌

### Current State

| Area | Status | Notes |
|------|--------|-------|
| Unit test runner (Jest/Vitest) | ❌ NOT CONFIGURED | No jest.config or vitest.config in any workspace |
| `npm run test` script | ⚠️ EXISTS (no-op) | In root package.json, runs workspace scripts — but none exist |
| API unit tests | ❌ ZERO | No controller/service tests |
| Web component tests | ❌ ZERO | No React component tests |
| E2E tests (Playwright) | ⚠️ PARTIAL | 4 specs: auth, buyer, seller (flaky), admin (SKIPPED) |
| Test database setup | ❌ MISSING | No test DB config, no fixtures |

### What Needs Testing

#### API Layer (Priority: HIGH)
- Auth routes: register, login, session validation, JWT expiry
- Listing CRUD: create, read, update, delete, filters, search
- Payment flow: Stripe session creation, webhook handling
- Admin routes: approve/reject, analytics queries
- Favorites: add, remove, list
- Messages: send, read, thread, unread count
- Saved searches: CRUD
- Reviews: create, list by target
- Inspections: request, status update

#### Web Layer (Priority: MEDIUM)
- VehicleCard renders correctly with data
- FilterSidebar state management
- SellWizard multi-step flow
- Auth forms validation
- LanguageSwitcher locale changes
- PriceDisplay formatting
- Pagination component

---

## Section 3: Task-by-Task Verification

### Phase 1 Tasks

| Task | Claimed | Actual | Issues |
|------|---------|--------|--------|
| P1-T01 Monorepo scaffolding | ✅ | ✅ | Functional |
| P1-T02 Database schema | ✅ | ✅ | Schema exists, migrations work |
| P1-T03 API boilerplate | ✅ | ✅ | Express app runs |
| P1-T04 Next.js scaffolding | ✅ | ✅ | App renders |
| P1-T05 Authentication | ✅ | ⚠️ | Works but no email verification, password reset is stub |
| P1-T06 Landing page | ✅ | ⚠️ | Renders but not compared to stitch, no i18n for most sections |
| P1-T07 Listings API | ✅ | ✅ | CRUD + filters functional |
| P1-T08 Car listings page | ✅ | ⚠️ | Works but hardcoded Estonian, no stitch fidelity check |
| P1-T09 Car detail page | ✅ | ⚠️ | Works but hardcoded Estonian |
| P1-T10 Sell wizard | ✅ | ⚠️ | Works but hardcoded Estonian, no stitch fidelity check |
| P1-T11 Photo upload | ✅ | ✅ | S3 presign works |
| P1-T12 Admin verification | ✅ | ⚠️ | Works but hardcoded Estonian |
| P1-T13 SEO (meta, sitemap) | ✅ | ⚠️ | sitemap.ts exists, JSON-LD exists, but meta titles are English-only |
| P1-T14 GDPR compliance | ✅ | ⚠️ | Cookie consent exists but legal pages content needs review |

### Phase 2 Tasks

| Task | Claimed | Actual | Issues |
|------|---------|--------|--------|
| P2-T01 Favorites | ✅ | ⚠️ | API works, UI exists, no i18n |
| P2-T02 Comparison | ✅ | ⚠️ | Works, hardcoded Estonian |
| P2-T03 Advanced search | ✅ | ⚠️ | Works, hardcoded Estonian |
| P2-T04 Saved searches | ✅ | ⚠️ | API exists, UI exists |
| P2-T05 Dashboard | ✅ | ⚠️ | Works, hardcoded Estonian |
| P2-T06 Messaging | ✅ | ⚠️ | API exists, UI exists, hardcoded Estonian |
| P2-T07 Email notifications | ✅ | ⚠️ | SendGrid configured, but likely not tested without API key |
| P2-T08 Newsletter | ✅ | ✅ | API + UI functional |
| P2-T09 Reviews | ✅ | ⚠️ | API exists, UI hardcoded Estonian |
| P2-T10 Inspection service | ✅ | ⚠️ | API exists, UI exists |

### Phase 3 Tasks

| Task | Claimed | Actual | Issues |
|------|---------|--------|--------|
| P3-T01 Stripe payments | ✅ | ⚠️ | Code exists but STRIPE_SECRET_KEY not set, untested |
| P3-T02 Dealership profiles | ✅ | ⚠️ | API route exists, UI exists |
| P3-T03 Admin analytics | ✅ | ⚠️ | Dashboard renders, hardcoded Estonian |

### Phase 4 Tasks

| Task | Claimed | Actual | Issues |
|------|---------|--------|--------|
| P4-T01 i18n setup | ✅ | ❌ INCOMPLETE | Library installed but 90% of components not internationalized |
| P4-T02 Core Web Vitals | ✅ | ⚠️ | `sizes` prop added, but no LCP/FID/CLS measurement done |
| P4-T03 E2E tests | ✅ | ⚠️ | 4 specs, 1 skipped, seller flaky |
| P4-T04 Sentry | ✅ | ⚠️ | Configured but no DSN set, untested |
| P4-T05 CI/CD | ✅ | ⚠️ | GitHub Actions YAML exists, not tested in CI |
| P4-T06 Mobile prep | ✅ | ⚠️ | API endpoint exists, landing page exists |

---

## Section 4: Stitch Design Fidelity — NOT VERIFIED ⚠️

8 stitch design references exist:
1. `kaarplus_home_landing_page/` — Landing page
2. `login_and_registration_modals/` — Auth forms
3. `navigation_and_cookie_consent_components/` — Nav, cookies
4. `sell_your_car_step-by-step_wizard/` — Sell wizard
5. `user_dashboard_and_management/` — Dashboard
6. `vehicle_detail_and_specification_page/` — Car detail
7. `vehicle_listings_grid_and_list_view/` — Listings
8. `vehicle_side-by-side_comparison/` — Compare page

**No systematic visual comparison was done** between stitch references and actual implementation. Each needs a pixel-level audit.

---

## Section 5: Build & Runtime Issues

| Issue | Severity | Location |
|-------|----------|----------|
| Unsplash images returning 404 | Medium | Landing page, seed data |
| "middleware" convention deprecated (Next.js 16) | Low | `middleware.ts` |
| Sentry DSN not set | Low | API startup warning |
| Stripe key not set | Medium | API startup warning |
| No dark mode support in CSS | Low | `globals.css` (only light theme) |
| `date-fns` locale hardcoded to `et` | Medium | `specs-grid.tsx` |

---

## Section 6: Corrected Task Status

The IMPLEMENTATION_PLAN.md should be updated to reflect reality:

### Tasks That Are Actually Complete ✅
P1-T01, P1-T02, P1-T03, P1-T04, P1-T07, P1-T11, P2-T08

### Tasks That Are Partially Done ⚠️ (need i18n + testing)
P1-T05, P1-T06, P1-T08, P1-T09, P1-T10, P1-T12, P1-T13, P1-T14,
P2-T01 through P2-T07, P2-T09, P2-T10,
P3-T01, P3-T02, P3-T03,
P4-T02, P4-T03, P4-T04, P4-T05, P4-T06

### Tasks That Are Fundamentally Incomplete ❌
P4-T01 (i18n — the core requirement of multi-language support is not met)

---

## Section 7: Recommended Action Plan

### Priority 1 — i18n Completion (BLOCKS EVERYTHING)
1. Create all 14 missing translation namespace JSON files (et, en, ru = 42 files)
2. Refactor every component to use `useTranslation()` with proper namespace
3. Verify language switching works end-to-end on every page

### Priority 2 — Test Infrastructure
1. Configure Vitest for `apps/web` and `apps/api`
2. Write unit tests for all API controllers
3. Write component tests for key UI components
4. Fix E2E tests (un-skip admin, fix seller flakiness)

### Priority 3 — Stitch Design Audit
1. Compare each stitch `screen.png` with actual rendered page
2. Document gaps
3. Fix CSS/layout discrepancies

### Priority 4 — Bug Fixes & Polish
1. Fix broken Unsplash image URLs
2. Replace `middleware.ts` with `proxy.ts` (Next.js 16)
3. Add dark mode CSS variables
4. Fix hardcoded `et` locale in date-fns usage
5. Add proper error boundaries

### Priority 5 — Environment & Integration
1. Document required environment variables
2. Add `.env.example` files with all variables
3. Verify Stripe webhook flow end-to-end
4. Verify SendGrid email delivery
