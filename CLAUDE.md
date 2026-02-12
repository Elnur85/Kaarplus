# CLAUDE.md - Kaarplus Project Instructions

## Project Overview

Kaarplus is a production-ready car sales marketplace for the Estonian market. Full-stack monorepo with Next.js frontend and Express backend, supporting B2C (dealership-to-customer) and C2C (peer-to-peer) vehicle sales with integrated Stripe payments.

**Target Market:** Estonia (language: Estonian primary, English secondary)
**Currency:** EUR only
**Design Reference:** https://www.figma.com/design/l71M638BL3FCtWZCOvEh1F/Kaarplus

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Express.js, TypeScript, Prisma ORM
- **Database:** PostgreSQL 15+
- **Auth:** NextAuth.js v5 (Auth.js) with JWT + HTTP-only cookies
- **Payments:** Stripe (EUR, Card, Apple Pay, Google Pay)
- **State:** Zustand (filters, favorites, compare, auth)
- **Forms:** React Hook Form + Zod validation
- **File Storage:** AWS S3 (eu-central-1)
- **Email:** SendGrid

## Monorepo Structure

```
kaarplus/
├── apps/
│   ├── web/                 # Next.js frontend (port 3000)
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components (ui/, layout/, listings/, etc.)
│   │   ├── lib/             # Utilities, hooks, stores
│   │   ├── public/          # Static assets
│   │   └── styles/          # Global CSS
│   └── api/                 # Express backend (port 4000)
│       ├── src/
│       │   ├── routes/      # Route definitions
│       │   ├── controllers/ # Request handling
│       │   ├── services/    # Business logic
│       │   ├── middleware/   # Auth, validation, rate limiting
│       │   ├── utils/       # Helpers (email, S3, stripe)
│       │   └── types/       # Shared TypeScript interfaces
│       └── prisma/          # Database schema & migrations
├── packages/
│   ├── database/            # Shared Prisma client & schema
│   ├── typescript-config/   # Shared TS configs
│   └── ui/                  # Shared UI components (if needed)
├── docs/                    # Project documentation
│   ├── IMPLEMENTATION_PLAN.md  # Phased implementation roadmap
│   ├── ARCHITECTURE.md      # System architecture
│   ├── API.md               # API reference
│   ├── DATABASE.md          # Schema documentation
│   ├── FEATURES.md          # Feature specifications
│   ├── DEVELOPMENT.md       # Development setup guide
│   └── tasks/               # Individual task specifications
├── .agent/                  # Agent workflow definitions
│   └── workflows/           # Repeatable workflow scripts
├── CLAUDE.md                # THIS FILE - Agent instructions
└── .editorconfig
```

## Common Commands

```bash
# Install dependencies (from root)
npm install

# Development
npm run dev              # Start all apps concurrently
npm run dev:web          # Start frontend only (port 3000)
npm run dev:api          # Start backend only (port 4000)

# Database (run from packages/database or use workspace flag)
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations (dev)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed development data
npm run db:reset         # Reset database (dev only)

# Build & Quality
npm run build            # Build all apps
npm run lint             # ESLint across all packages
npm run lint:fix         # Auto-fix lint issues
npm run format           # Prettier format all files
npm run typecheck        # TypeScript check across all packages

# Testing
npm run test             # Run unit tests (Vitest)
npm run test:watch       # Watch mode
npm run test:e2e         # Run Playwright E2E tests
npm run test:coverage    # Coverage report
```

## Code Conventions

### TypeScript

- Strict mode enabled everywhere
- Use `interface` for object shapes, `type` for unions/intersections
- Named exports only (no default exports)
- Async/await over raw promises
- All API responses typed with shared interfaces
- Descriptive variable names, JSDoc for complex functions

### React / Next.js

- Server Components by default; add `"use client"` only when needed
- Functional components with hooks
- File naming: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- Colocate component-specific types in the same file
- Use Shadcn/ui components — do not build custom UI primitives
- Every page exports `metadata` or `generateMetadata` for SEO

### Styling

- Tailwind CSS utility classes (no custom CSS unless absolutely necessary)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow Shadcn/ui theming conventions
- Desktop-first responsive design (matches Figma)

### API Design

- RESTful endpoints under `/api/`
- Zod schemas for all request validation
- Consistent response format:
  - Success: `{ data: T, meta?: { page, pageSize, total } }`
  - Error: `{ error: string, details?: unknown }`
- All routes authenticated by default; explicitly mark `[Public]` routes
- Middleware pipeline: CORS → Rate Limit → Auth → Validation → Controller → Service

### Database

- Prisma schema in `packages/database/prisma/schema.prisma`
- Always create migrations for schema changes (never `db push` in production)
- Use `cuid()` for all primary keys
- Index frequently queried columns
- JSONB for flexible metadata (e.g., vehicle features)

### Testing

- Unit tests: Vitest (colocated `*.test.ts` files)
- E2E tests: Playwright (in `apps/web/e2e/`)
- Naming: `<module>.test.ts` or `<module>.spec.ts`

## Key Architectural Decisions

1. **Monorepo with npm workspaces** — shared types and Prisma client across apps
2. **Separate Express backend** — dedicated API server for business logic, webhooks, background jobs
3. **Server Components first** — leverage Next.js SSR for SEO-critical pages (listings, details)
4. **Prisma as single source of truth** — schema generates types used by both frontend and backend
5. **Stripe webhooks for payment** — never trust client-side callbacks
6. **JWT in HTTP-only cookies** — secure, cross-origin auth between web and API
7. **Zustand over Redux** — simpler API for client state (filters, compare, favorites)
8. **Shadcn/ui for design system** — matches Figma, fully customizable, no vendor lock-in

## Environment Variables

### Frontend (`apps/web/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

### Backend (`apps/api/.env`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kaarplus
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AWS_S3_BUCKET=kaarplus-images
AWS_S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SENDGRID_API_KEY=
JWT_SECRET=
CORS_ORIGIN=http://localhost:3000
PORT=4000
```

## SEO Requirements (Every Public Page)

- Dynamic `<title>` and `<meta description>`
- Open Graph and Twitter Card tags
- JSON-LD structured data (Vehicle, Organization, BreadcrumbList)
- Proper heading hierarchy (single H1 per page)
- Estonian language meta (`lang="et"`)
- Alt text on all images
- Canonical URLs
- Estonian keywords: "autod Eestis", "auto ostmine", "kasutatud autod"

## GDPR Requirements

- Cookie consent banner with granular options (essential, analytics, marketing)
- User data export endpoint (`GET /api/user/gdpr/export`)
- Account deletion endpoint (`DELETE /api/user/gdpr/delete`)
- Consent logging with timestamps and IP
- Minimal data collection principle
- Privacy policy in Estonian and English

## Agent Workflow Guidelines

When implementing features:

1. **Always check `docs/IMPLEMENTATION_PLAN.md`** for current phase and task status
2. **Read the relevant task file** in `docs/tasks/` before starting
3. **Update task status** after completing work (mark as ✅)
4. **Run `npm run lint` and `npm run typecheck`** after code changes
5. **Create tests** for business logic and API endpoints
6. **Follow the phase order** — don't skip ahead unless dependencies are met
7. **Reference Figma** for all UI implementation decisions

## Important Business Rules

- Currency is EUR only — never show other currencies
- Estonian market focus — use Estonian keywords for SEO
- Photos require manual verification before listing goes live
- Listings follow PENDING → ACTIVE workflow (admin approval)
- Maximum 30 photos per listing, minimum 3
- Price always shown with VAT status indicator
- Individual sellers limited to 5 active listings
- Dealerships get unlimited listings
- Payment is full amount only (no deposits/installments)
