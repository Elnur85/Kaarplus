# Architecture

## System Overview

Kaarplus is a monorepo with two applications and shared packages.

```
┌─────────────────┐     ┌─────────────────┐
│   apps/web      │────▶│   apps/api      │
│   Next.js 14+   │     │   Express.js    │
│   Port 3000     │     │   Port 4000     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    ┌──────────────┐   │
         └───▶│ packages/    │◀──┘
              │  database    │
              │  (Prisma)    │
              └──────┬───────┘
                     │
              ┌──────▼───────┐
              │  PostgreSQL  │
              │  15+         │
              └──────────────┘
```

## Frontend Architecture (apps/web)

### Routing (App Router)

```
app/
├── (public)/              # Public layout group
│   ├── page.tsx           # Landing page (/)
│   ├── cars/
│   │   ├── page.tsx       # Listings (/cars)
│   │   └── [id]/
│   │       └── [slug]/
│   │           └── page.tsx  # Detail (/cars/[id]/[slug])
│   ├── search/
│   │   └── advanced/
│   │       └── page.tsx   # Advanced search
│   ├── compare/
│   │   └── page.tsx       # Comparison
│   └── sell/
│       └── page.tsx       # Sell wizard
├── (auth)/                # Auth layout group
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── dashboard/             # Authenticated layout group
│   ├── page.tsx           # Dashboard overview
│   ├── listings/
│   ├── messages/
│   ├── favorites/
│   └── settings/
├── admin/                 # Admin layout group
│   ├── listings/
│   ├── users/
│   └── analytics/
├── (legal)/               # Legal pages
│   ├── privacy/
│   ├── terms/
│   ├── cookies/
│   └── faq/
└── api/                   # Next.js API routes (auth only)
    └── auth/
        └── [...nextauth]/
```

### Component Organization

```
components/
├── ui/                    # Shadcn/ui primitives (button, input, etc.)
├── layout/                # Header, Footer, Sidebar, Navigation
├── listings/              # Car card, filters, sort controls
├── search/                # Search bar, filter panels
├── sell/                  # Sell wizard steps
├── comparison/            # Comparison table
├── auth/                  # Login/register forms
└── shared/                # Reusable composites (image gallery, pagination)
```

### State Management

- **Server state:** React Server Components + fetch (no client cache needed)
- **Client state:** Zustand stores for:
  - `useFilterStore` - active search filters
  - `useFavoritesStore` - optimistic favorites updates
  - `useCompareStore` - comparison selection (max 4-5 cars)
  - `useAuthStore` - client-side auth state

## Backend Architecture (apps/api)

### Layer Structure

```
src/
├── routes/          # Route definitions (Express Router)
├── controllers/     # Request handling, response formatting
├── services/        # Business logic
├── middleware/       # Auth, validation, rate limiting, error handling
├── utils/           # Helpers (email, S3 upload, stripe)
└── types/           # Shared TypeScript interfaces
```

### Middleware Pipeline

```
Request → CORS → Rate Limit → Auth → Validation (Zod) → Controller → Service → Response
                                                                         ↓
                                                                   Error Handler
```

## Database Design

See [DATABASE.md](./DATABASE.md) for full schema documentation.

Key decisions:

- `cuid()` for all IDs (URL-safe, sortable)
- JSONB `features` column on Listing for flexible equipment data
- Full-text search index on make + model + description
- Composite indexes on common filter combinations
- Soft deletes not used; listings use status enum (DRAFT, PENDING, ACTIVE, SOLD, REJECTED, EXPIRED)

## Authentication Flow

```
1. User registers/logs in via NextAuth.js (apps/web)
2. NextAuth creates session with JWT strategy
3. JWT stored in HTTP-only cookie
4. Frontend sends cookie with API requests
5. Backend middleware validates JWT
6. User role checked against route permissions
```

## Payment Flow (Stripe)

```
1. Buyer clicks "Purchase" on listing detail page
2. Frontend calls POST /api/payments/create-intent
3. Backend creates Stripe PaymentIntent (EUR)
4. Frontend renders Stripe Elements (card, Apple Pay, Google Pay)
5. User completes payment on client
6. Stripe sends webhook to POST /api/webhooks/stripe
7. Backend verifies webhook signature
8. Backend updates listing status to SOLD
9. Confirmation emails sent to buyer and seller
```

## File Upload Flow

```
1. Seller selects photos in sell wizard
2. Client-side validation (type, size, count)
3. Frontend requests presigned S3 URL from backend
4. Frontend uploads directly to S3
5. Backend creates ListingImage records (verified=false)
6. Listing status set to PENDING
7. Admin reviews photos in verification queue
8. On approval: listing published, status = ACTIVE
```

## User Roles

| Role              | Browse | Favorites | List      | Verify | Admin |
| ----------------- | ------ | --------- | --------- | ------ | ----- |
| Guest             | Yes    | No        | No        | No     | No    |
| Buyer             | Yes    | Yes       | No        | No     | No    |
| Individual Seller | Yes    | Yes       | 5 max     | No     | No    |
| Dealership        | Yes    | Yes       | Unlimited | No     | No    |
| Support           | Yes    | Yes       | No        | Yes    | No    |
| Admin             | Yes    | Yes       | Yes       | Yes    | Yes   |

## Deployment

- **Frontend:** Vercel (automatic deployments from main branch)
- **Backend:** Railway (European region, auto-deploy from main)
- **Database:** Railway PostgreSQL or Supabase
- **File Storage:** AWS S3 eu-central-1
- **DNS/CDN:** Cloudflare
