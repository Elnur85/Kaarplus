# Kaarplus — Implementation Plan

> **Last Updated:** 2026-02-16
> **Status:** Phase 5 — Production Readiness (In Progress)
> **Total Tasks:** 27 original + 7 remediation = 34

---

## How to Use This Plan

This document is the **single source of truth** for project progress. Each task:

- Has a unique ID (e.g., `P1-T01`)
- Maps to a detailed spec in `docs/tasks/`
- Lists dependencies that must be completed first
- Has clear acceptance criteria

**Agent workflow:**

1. Pick the next uncompleted task in order (respect dependencies)
2. Read `docs/tasks/<task-id>.md` for full specification
3. Implement, test, and verify
4. Mark task as ✅ in this file and in the task file
5. Commit with message: `feat(<scope>): <description> [<task-id>]`

**Quality standard:** A task is only ✅ when:
- Code compiles without errors
- All user-facing strings use translation keys (no hardcoded text)
- Unit/integration tests exist for the feature
- The feature works in all 3 languages (et, ru, en)

---

## Phase 1 — Core MVP (Foundation + Essential Features)

The goal of Phase 1 is a working, deployable application with core listing browsing, vehicle detail pages, seller submission, and authentication — the minimum needed to demonstrate value.

| ID     | Task                                        | Status | Dependencies     | Est. |
| ------ | ------------------------------------------- | ------ | ---------------- | ---- |
| P1-T01 | Monorepo scaffolding & tooling              | ✅     | —                | 3h   |
| P1-T02 | Database schema & Prisma setup              | ✅     | P1-T01           | 2h   |
| P1-T03 | Express API server boilerplate              | ✅     | P1-T01           | 2h   |
| P1-T04 | Next.js app scaffolding & design system     | ✅     | P1-T01           | 3h   |
| P1-T05 | Authentication (NextAuth + Express JWT)     | ✅     | P1-T02, T03, T04 | 4h   |
| P1-T06 | Landing page                                | ✅     | P1-T04           | 4h   |
| P1-T07 | Listings API (CRUD + filters + search)      | ✅     | P1-T02, T03      | 4h   |
| P1-T08 | Car listings page (list/grid + filters)     | ✅     | P1-T04, T07      | 5h   |
| P1-T09 | Car detail page                             | ✅     | P1-T04, T07      | 4h   |
| P1-T10 | Sell vehicle wizard (multi-step form)       | ✅     | P1-T05, T07      | 5h   |
| P1-T11 | Photo upload (S3 presigned URLs)            | ✅     | P1-T03, T10      | 3h   |
| P1-T12 | Admin listing verification queue            | ✅     | P1-T05, T07      | 3h   |
| P1-T13 | SEO implementation (meta, sitemap, JSON-LD) | ✅     | P1-T06, T08, T09 | 3h   |
| P1-T14 | GDPR compliance (consent, privacy, export)  | ✅     | P1-T05           | 3h   |

### Phase 1 — Acceptance Criteria

- [x] Visitor can browse car listings with filters and pagination
- [x] Visitor can view a detailed car page with image gallery
- [x] Authenticated user can create a listing via multi-step wizard
- [x] Admin can approve/reject pending listings
- [x] All public pages have proper SEO meta tags and JSON-LD
- [x] Cookie consent banner is functional
- [ ] Application is deployable to Vercel (web) and Railway (API)

---

## Phase 2 — Engagement Features

After MVP launch, add features that drive user retention and interaction.

| ID     | Task                                    | Status | Dependencies   | Est. |
| ------ | --------------------------------------- | ------ | -------------- | ---- |
| P2-T01 | Favorites system (API + UI)             | ✅     | P1-T05, P1-T07 | 3h   |
| P2-T02 | Car comparison page                     | ✅     | P1-T08         | 3h   |
| P2-T03 | Advanced search page                    | ✅     | P1-T08         | 4h   |
| P2-T04 | Saved searches with email alerts        | ✅     | P2-T03, P1-T05 | 3h   |
| P2-T05 | User dashboard (overview + my listings) | ✅     | P1-T05, P1-T10 | 4h   |
| P2-T06 | Messaging system (buyer-seller)         | ✅     | P1-T05         | 4h   |
| P2-T07 | Email notifications (transactional)     | ✅     | P1-T03         | 3h   |
| P2-T08 | Newsletter signup                       | ✅     | P2-T07         | 1h   |
| P2-T09 | **Reviews system (Carvago-style)**      | ✅     | P1-T05, P1-T07 | 4h   |
| P2-T10 | **Vehicle inspection service**          | ✅     | P1-T07         | 3h   |

### Phase 2 — Acceptance Criteria

- [x] Users can save/remove favorites and see them on `/favorites`
- [x] Users can compare up to 4 cars side-by-side
- [x] Advanced search with all filter categories works
- [x] Users receive email notifications for key events
- [x] Users can message sellers through the platform
- [x] Dashboard shows listing stats and management tools
- [x] **Carvago-style reviews are functional (rating + comments)**
- [x] **Vehicle inspection service can be requested and reports generated**

---

## Phase 3 — Monetization

Introduce payment processing and premium features.

| ID     | Task                           | Status | Dependencies   | Est. |
| ------ | ------------------------------ | ------ | -------------- | ---- |
| P3-T01 | Stripe payment integration     | ✅     | P1-T05, P1-T07 | 5h   |
| P3-T02 | Dealership accounts & profiles | ✅     | P1-T05         | 3h   |
| P3-T03 | Admin analytics dashboard      | ✅     | P1-T12         | 3h   |

### Phase 3 — Acceptance Criteria

- [x] Buyers can purchase vehicles via Stripe (card, Apple Pay, Google Pay)
- [x] Payment webhooks correctly update listing status
- [x] Dealerships have enhanced profiles with unlimited listings
- [x] Admin dashboard shows platform analytics

---

## Phase 4 — Polish & Scale

Performance optimization, testing, monitoring, and internationalization.

| ID     | Task                                              | Status | Dependencies | Est. |
| ------ | ------------------------------------------------- | ------ | ------------ | ---- |
| P4-T01 | i18n setup (Estonian + Russian + English)          | ⚠️     | P1-T06       | 5h   |
| P4-T02 | Core Web Vitals optimization                      | ✅     | Phase 1      | 3h   |
| P4-T03 | E2E test suite (Playwright)                       | ⚠️     | Phase 1      | 4h   |
| P4-T04 | Error tracking (Sentry integration)               | ✅     | P1-T01       | 2h   |
| P4-T05 | CI/CD pipeline (GitHub Actions)                   | ✅     | P1-T01       | 2h   |
| P4-T06 | **Mobile app preparation (investor screens)**     | ✅     | Phase 1      | 3h   |

> **P4-T01 Note:** Library installed, provider configured, switcher working, but only ~6/60+ components use `useTranslation()`. Remediated in P5-T01.
> **P4-T03 Note:** 4 E2E specs exist, 1 skipped (admin), seller flaky. No unit tests. Remediated in P5-T03.

### Phase 4 — Acceptance Criteria

- [ ] Application supports **Estonian, Russian, and English** languages ← NOT MET
- [x] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Critical user flows covered by E2E tests ← PARTIAL
- [x] Errors automatically reported to Sentry
- [x] PRs trigger automated tests and preview deployments
- [x] **API prepared for mobile app consumption with investor screens**

---

## Phase 5 — Production Readiness (NEW)

Remediation phase to bring the project to actual production quality.

| ID     | Task                                                        | Status | Dependencies       | Est. |
| ------ | ----------------------------------------------------------- | ------ | ------------------ | ---- |
| P5-T01 | i18n completion — all components translated (et/en/ru)      | ✅     | P4-T01             | 8h   |
| P5-T02 | Stitch design fidelity audit & fixes                        | ✅     | Phase 1            | 4h   |
| P5-T03 | Test infrastructure setup (Vitest) + API unit tests         | ✅     | P1-T03, P1-T07     | 6h   |
| P5-T04 | Web component tests + E2E fixes                             | ✅     | P5-T03             | 5h   |
| P5-T05 | Bug fixes & broken assets cleanup                           | ✅     | Phase 1            | 3h   |
| P5-T06 | Environment documentation & deployment readiness            | ✅     | All previous       | 2h   |
| P5-T07 | Final integration test & quality gate                       | ✅     | P5-T01 to P5-T06   | 2h   |
| P6-T01 | Security Hardening: Resource Ownership Verification          | ✅     | Phase 1, Phase 5   | 3h   |
| P6-T02 | Ad Engine: Full UI Integration & Dashboard                  | ✅     | Phase 2, Phase 3   | 5h   |
| P6-T03 | Caching & DB Index Optimization                             | ⬜     | Phase 1            | 3h   |
| P6-T04 | Messaging System: Real-time with WebSockets                 | ⬜     | P2-T06             | 5h   |

### Phase 6 — Acceptance Criteria

- [ ] Users can only edit/delete their OWN listings (and admins can do all)
- [ ] Ad slots are functional on Listings and Search pages
- [ ] Admin panel includes a basic Ad Management dashboard
- [ ] API responses for search/filters are under 200ms (caching)
- [ ] Messaging supports real-time updates (no page refresh)

---

## Dependency Graph (Simplified)

```
P1-T01 (Monorepo Setup)
├── P1-T02 (Database) ──┐
├── P1-T03 (API Server) ├── P1-T05 (Auth) ── P1-T10 (Sell Wizard) ── P1-T11 (Photo Upload)
├── P1-T04 (Next.js) ───┘       │                    │
│       │                        ├── P1-T12 (Admin Queue)
│       │                        ├── P1-T14 (GDPR)
│       │                        │
│       ├── P1-T06 (Landing) ────┤
│       │                        ├── P1-T13 (SEO)
│       │                        │
│       ├── P1-T07 (Listings API)├── P1-T08 (Listings UI)
│       │                        ├── P1-T09 (Detail Page)
│       │                        │
│       │                        ├── P2-T01 (Favorites)
│       │                        ├── P2-T02 (Compare)
│       │                        ├── P2-T03 (Adv Search) ── P2-T04 (Saved Searches)
│       │                        │
│       │                        ├── P3-T01 (Stripe)
│       │                        └── P3-T02 (Dealerships)
│       │
│       ├── P2-T05 (Dashboard)
│       ├── P2-T06 (Messaging)
│       └── P2-T07 (Email) ── P2-T08 (Newsletter)
│
├── P4-T04 (Sentry)
├── P4-T05 (CI/CD)
│
└── P5-T01 (i18n completion)
    P5-T02 (Stitch audit)
    P5-T03 (Test infra) ── P5-T04 (Web tests + E2E)
    P5-T05 (Bug fixes)
    P5-T06 (Env docs) ── P5-T07 (Final quality gate)
```

---

## Commit Convention

All commits should follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): description [TASK-ID]
fix(scope): description [TASK-ID]
docs(scope): description
chore(scope): description
```

**Scopes:** `web`, `api`, `db`, `auth`, `listings`, `search`, `payments`, `admin`, `seo`, `gdpr`, `infra`, `i18n`, `test`

---

## Risk Register

| Risk                               | Impact | Mitigation                                                       |
| ---------------------------------- | ------ | ---------------------------------------------------------------- |
| Figma design ambiguity             | Medium | Use Shadcn/ui defaults where Figma is unclear; iterate           |
| PostgreSQL full-text search limits | Low    | Can migrate to Elasticsearch later if needed                     |
| Stripe Estonia requirements        | Medium | Verify Stripe Connect availability for Estonian businesses early |
| Image storage costs                | Low    | Implement client-side compression before upload                  |
| GDPR legal review                  | High   | Have legal counsel review privacy policy before launch           |
| i18n incomplete                    | HIGH   | Phase 5 remediation — P5-T01 is top priority                    |
| No unit tests                      | HIGH   | Phase 5 remediation — P5-T03/P5-T04                             |
