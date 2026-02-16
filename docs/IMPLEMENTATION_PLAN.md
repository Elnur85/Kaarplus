# Kaarplus — Implementation Plan

> **Last Updated:** 2026-02-15
> **Status:** Phase 1 — Complete ✅ | Phase 2 — Ready
> **Total Tasks:** 27 across 4 phases

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

- [ ] Visitor can browse car listings with filters and pagination
- [ ] Visitor can view a detailed car page with image gallery
- [ ] Authenticated user can create a listing via multi-step wizard
- [ ] Admin can approve/reject pending listings
- [ ] All public pages have proper SEO meta tags and JSON-LD
- [ ] Cookie consent banner is functional
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

| ID     | Task                                | Status | Dependencies | Est. |
| ------ | ----------------------------------- | ------ | ------------ | ---- |
| P4-T01 | i18n setup (Estonian + Russian + English) | ✅     | P1-T06       | 5h   |
| P4-T02 | Core Web Vitals optimization              | ✅     | Phase 1      | 3h   |
| P4-T03 | E2E test suite (Playwright)               | ✅     | Phase 1      | 4h   |
| P4-T04 | Error tracking (Sentry integration)       | ✅     | P1-T01       | 2h   |
| P4-T05 | CI/CD pipeline (GitHub Actions)           | ✅     | P1-T01       | 2h   |
| P4-T06 | **Mobile app preparation (investor screens)** | ✅     | Phase 1      | 3h   |

### Phase 4 — Acceptance Criteria

- [x] Application supports **Estonian, Russian, and English** languages
- [x] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [x] Critical user flows covered by E2E tests
- [x] Errors automatically reported to Sentry
- [x] PRs trigger automated tests and preview deployments
- [x] **API prepared for mobile app consumption with investor screens**

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
└── P4-T05 (CI/CD)
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

**Scopes:** `web`, `api`, `db`, `auth`, `listings`, `search`, `payments`, `admin`, `seo`, `gdpr`, `infra`

---

## Risk Register

| Risk                               | Impact | Mitigation                                                       |
| ---------------------------------- | ------ | ---------------------------------------------------------------- |
| Figma design ambiguity             | Medium | Use Shadcn/ui defaults where Figma is unclear; iterate           |
| PostgreSQL full-text search limits | Low    | Can migrate to Elasticsearch later if needed                     |
| Stripe Estonia requirements        | Medium | Verify Stripe Connect availability for Estonian businesses early |
| Image storage costs                | Low    | Implement client-side compression before upload                  |
| GDPR legal review                  | High   | Have legal counsel review privacy policy before launch           |
