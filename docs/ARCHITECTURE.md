# Architecture

> System architecture and data flow for the Kaarplus monorepo. Derived from actual source code.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
┌─────────────▼─────────────┐   ┌─────────────▼─────────────┐
│     apps/web              │   │     External Services     │
│     Next.js 15            │   │                           │
│     Port 3000             │   │  ┌─────────────────────┐  │
│                           │   │  │  AWS S3             │  │
│  ┌─────────────────┐      │   │  │  (Vehicle Images)   │  │
│  │  App Router     │      │   │  └─────────────────────┘  │
│  │  - Server Comp  │◄─────┼───┼─►┌─────────────────────┐  │
│  │  - Client Comp  │      │   │  │  Stripe             │  │
│  └─────────────────┘      │   │  │  (Payments)         │  │
│                           │   │  └─────────────────────┘  │
│  ┌─────────────────┐      │   │  ┌─────────────────────┐  │
│  │  Zustand Stores │      │   │  │  SendGrid           │  │
│  │  - Filters      │      │   │  │  (Email)            │  │
│  │  - Favorites    │      │   │  └─────────────────────┘  │
│  │  - Compare      │      │   │  ┌─────────────────────┐  │
│  └─────────────────┘      │   │  │  Sentry             │  │
│                           │   │  │  (Error Tracking)   │  │
└───────────────────────────┘   │  └─────────────────────┘  │
                                └───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         apps/api                                 │
│                         Express.js 5.2.1                         │
│                         Port 4000                                │
│                                                                  │
│  Request Flow:                                                   │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐          │
│  │  Helmet │──►│  CORS   │──►│  Rate   │──►│  Auth   │          │
│  │         │   │         │   │  Limit  │   │  JWT    │          │
│  └─────────┘   └─────────┘   └─────────┘   └────┬────┘          │
│                                                  │               │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐        ▼               │
│  │  Zod    │◄──│Controller│◄──│ Service │◄─── Validation        │
│  │Validate │   │         │   │         │                        │
│  └────┬────┘   └────┬────┘   └────┬────┘                        │
│       │             │             │                              │
│       └─────────────┴─────────────┘                              │
│                     │                                            │
│                     ▼                                            │
│         ┌─────────────────────┐                                  │
│         │  @kaarplus/database │                                  │
│         │  (Prisma Client)    │                                  │
│         └──────────┬──────────┘                                  │
└────────────────────┼─────────────────────────────────────────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │  PostgreSQL 15+     │
         │  (Railway/Supabase) │
         └─────────────────────┘
```

---

## 2. Frontend Architecture (apps/web)

### 2.1 Routing (App Router)

Route groups organize pages by access level:

```
app/
├── (auth)/                    # Auth routes (minimal layout)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
├── (public)/                  # Public routes (main layout)
│   ├── page.tsx               # Landing page (/)
│   ├── listings/page.tsx      # Car listings
│   ├── listings/[id]/page.tsx # Car detail
│   ├── search/page.tsx        # Advanced search
│   ├── sell/page.tsx          # Sell wizard (auth check in page)
│   ├── compare/page.tsx       # Comparison
│   ├── dealers/page.tsx       # Dealerships list
│   ├── dealers/[id]/page.tsx  # Dealership detail
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── help/page.tsx
│   ├── safety/page.tsx
│   ├── fraud/page.tsx
│   ├── inspections/page.tsx
│   ├── careers/page.tsx
│   ├── sitemap/page.tsx
│   └── cars/page.tsx
├── (legal)/                   # Legal pages
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── cookies/page.tsx
│   └── faq/page.tsx
├── admin/                     # Admin routes (admin layout)
│   ├── page.tsx               # Admin overview
│   ├── listings/page.tsx
│   ├── users/page.tsx
│   ├── analytics/page.tsx
│   └── ads/
│       ├── page.tsx
│       ├── [id]/page.tsx
│       └── inventory/page.tsx
├── dashboard/                 # User dashboard (dashboard layout)
│   ├── page.tsx               # Dashboard overview
│   ├── listings/page.tsx
│   ├── favorites/page.tsx
│   ├── messages/page.tsx
│   ├── saved-searches/page.tsx
│   ├── inspections/page.tsx
│   └── settings/page.tsx
├── api/                       # API routes (NextAuth)
│   └── auth/[...nextauth]/route.ts
├── layout.tsx                 # Root layout
├── sitemap.ts                 # Dynamic sitemap
└── robots.ts                  # robots.txt
```

### 2.2 Component Organization

```
src/components/
├── ui/                        # Shadcn/ui primitives (DO NOT MODIFY)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ... (30+ components)
├── layout/                    # App shell
│   ├── header.tsx
│   ├── footer.tsx
│   └── mobile-nav.tsx
├── shared/                    # Reusable composites
│   ├── vehicle-card.tsx
│   ├── price-display.tsx
│   ├── spec-icons.tsx
│   ├── favorite-button.tsx
│   ├── search-bar.tsx
│   └── pagination.tsx
├── landing/                   # Landing page sections
├── listings/                  # Listing page components
├── car-detail/               # Car detail components
├── sell/                     # Sell wizard components
├── auth/                     # Auth forms
├── dashboard/                # Dashboard components
├── comparison/               # Comparison components
├── admin/                    # Admin components
└── gdpr/                     # GDPR components
```

**Component Rules:**
- Server Components by default
- Add `"use client"` ONLY for: hooks, browser APIs, event handlers
- Named exports only (`export function ComponentName()`)
- One component per file
- File naming: `kebab-case.tsx`

### 2.3 State Management

| Type | Technology | Usage |
|------|------------|-------|
| Server State | React Server Components + API calls | Data fetching |
| Client State | Zustand | UI state only |
| URL State | Next.js useSearchParams | Shareable filters |

**Zustand Stores:**
```typescript
// src/stores/useFilterStore.ts
- Manages: make, model, priceMin, priceMax, yearMin, yearMax, fuelType[], transmission, bodyType, color, query, sort, page
- Actions: setFilter(key, value), resetFilters(), setPage(n)
- URL sync: Filters reflect in URL query params

// src/stores/useFavoritesStore.ts
- Manages: Set<string> of listing IDs
- Actions: toggleFavorite(id), setFavorites(ids[]), isFavorite(id)
- Persistence: localStorage + API sync when authenticated

// src/stores/useCompareStore.ts
- Manages: Array<VehicleSummary> (max 4)
- Actions: addToCompare(vehicle), removeFromCompare(id), clearCompare()
- Constraint: Max 4 items

// src/stores/useLanguageStore.ts
- Manages: locale ("et" | "en" | "ru")
- Actions: setLocale(locale)
- Default: "et"
```

### 2.4 API Client Pattern

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchListings(filters: FilterState) {
  const params = new URLSearchParams();
  // ... build params
  
  const res = await fetch(`${API_URL}/api/listings?${params}`, {
    credentials: 'include', // Send cookies
  });
  
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
```

### 2.5 i18n Architecture

**Library:** react-i18next (not next-intl)

```
messages/
├── et/                        # Estonian (primary)
│   ├── common.json
│   ├── home.json
│   ├── listings.json
│   └── ... (21 namespaces)
├── en/                        # English
└── ru/                        # Russian
```

**Usage:**
```typescript
// Client Component
"use client";
import { useTranslation } from 'react-i18next';

export function Component() {
  const { t } = useTranslation('namespace');
  return <h1>{t('key.subkey')}</h1>;
}
```

---

## 3. Backend Architecture (apps/api)

### 3.1 Layer Structure

```
src/
├── index.ts                   # Entry point (server start)
├── app.ts                     # Express app configuration
├── routes/                    # Route definitions
│   ├── index.ts              # Route aggregator
│   ├── auth.ts               # Authentication routes
│   ├── listings.ts           # Listing routes
│   ├── search.ts             # Search routes
│   ├── user.ts               # User routes (favorites, messages, etc.)
│   ├── admin.ts              # Admin routes
│   ├── uploads.ts            # File upload routes
│   ├── dealerships.ts        # Dealership routes
│   ├── newsletter.ts         # Newsletter routes
│   ├── reviews.ts            # Review routes
│   ├── payments.ts           # Payment routes
│   ├── webhooks.ts           # Stripe webhooks
│   ├── content-blocks.ts     # Ad serving routes
│   ├── mobile.ts             # Mobile app routes
│   └── debug-sentry.ts       # Debug routes (dev only)
├── controllers/               # Request handlers
│   ├── listingController.ts
│   ├── authController.ts
│   └── ...
├── services/                  # Business logic
│   ├── socketService.ts
│   ├── emailService.ts
│   └── passwordResetService.ts
├── middleware/                # Express middleware
│   ├── auth.ts               # JWT verification
│   ├── validate.ts           # Zod validation
│   ├── errorHandler.ts       # Global error handler
│   ├── rateLimiter.ts        # Rate limiting
│   ├── cors.ts               # CORS configuration
│   ├── helmet.ts             # Security headers
│   ├── ownership.ts          # Resource ownership check
│   └── socketAuth.ts         # Socket.io auth
├── schemas/                   # Zod validation schemas
│   ├── listing.ts
│   ├── auth.ts
│   ├── admin.ts
│   └── ad.ts
├── utils/                     # Utilities
│   ├── errors.ts             # Custom error classes
│   ├── logger.ts             # Pino logger
│   ├── s3.ts                 # AWS S3 operations
│   ├── stripe.ts             # Stripe configuration
│   ├── cache.ts              # In-memory cache
│   └── asyncHandler.ts       # Async wrapper
├── types/
│   ├── express.d.ts          # Express type extensions
│   └── socket.ts             # Socket.io types
└── socket/
    └── connectionHandler.ts  # Socket.io connection handling
```

### 3.2 Middleware Pipeline

```
Request → Helmet → CORS → Rate Limit → Cookie Parser → JSON Parser → 
  Route Handler → Auth (if required) → Validation (Zod) → Controller → 
  Service → Database → Response
                          ↓
                    Error Handler (catches all errors)
```

**Order matters.** Error handler must be last.

### 3.3 Authentication Mechanism

**JWT in HTTP-only Cookies:**

1. User logs in via `/api/auth/login`
2. Server validates credentials
3. Server signs JWT with `JWT_SECRET`
4. Server sets HTTP-only cookie:
   ```typescript
   res.cookie('token', jwt, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 24 * 60 * 60 * 1000, // 24 hours
   });
   ```
5. Frontend sends cookie automatically with each request
6. `requireAuth` middleware verifies JWT

**NextAuth.js Integration (Frontend):**
- Frontend uses NextAuth.js for session management
- Credentials provider calls Express API
- Session contains user info (id, email, role, name)

### 3.3.1 User Roles

The system uses a simplified role model with the following roles:

| Role | Description | Permissions |
|------|-------------|-------------|
| `USER` | Regular authenticated user | Browse, search, message, create listings (limit: 5 active) |
| `DEALERSHIP` | Reserved for future use | Future dealership features |
| `ADMIN` | System administrator | Full access to all resources |
| `SUPPORT` | Support staff | Limited admin access |

**Guest Users (non-authenticated):**
- Can browse and view listings
- Can contact sellers via email form
- Cannot use WebSocket messaging
- Cannot create listings

**Role Enum (Prisma):**
```typescript
enum UserRole {
  USER           // @default - all new registrations
  DEALERSHIP     // Reserved for future
  ADMIN
  SUPPORT
}
```

### 3.4 Error Handling Pattern

**Custom Error Classes:**
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: ErrorCode
  ) { super(message); }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly details?: unknown) {
    super(400, message, ErrorCode.VALIDATION_ERROR);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, ErrorCode.UNAUTHORIZED);
  }
}
```

**Error Response Format:**
```json
{
  "error": "Human-readable message",
  "message": "Alias for frontend compatibility",
  "code": "ERROR_CODE",
  "details": {} // Optional, for validation errors
}
```

### 3.5 Socket.io (Real-time Messaging)

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Client    │◄──────────────────►│  Socket.io  │
│  (Browser)  │                    │   Server    │
└─────────────┘                    └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  Message    │
                                   │  Service    │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  PostgreSQL │
                                   └─────────────┘
```

**Events:**
- `connection` - New client connected
- `message:send` - Send new message
- `message:read` - Mark messages as read
- `disconnect` - Client disconnected

---

## 4. Shared Code

### 4.1 @kaarplus/database

**Exports:**
```typescript
// packages/database/src/index.ts
export { prisma, Prisma } from './client';
export * from '@prisma/client'; // Generated types
```

**Used by:**
- `apps/api` - Database operations
- `apps/web` - Type imports only (Server Components)

### 4.2 Type Sharing

**Prisma generates types from schema** - single source of truth:
```typescript
// Frontend can import types
import { Listing, User, UserRole } from '@kaarplus/database';
```

### 4.3 Validation Schema Sharing

**Separate schemas for frontend/backend** (different validation needs):
```
apps/web/src/schemas/       # Frontend forms
apps/api/src/schemas/       # API validation
```

---

## 5. Data Flow Examples

### 5.1 Browse Listings (Server Component)

```
User Request
    │
    ▼
┌─────────────────┐
│  Next.js Server │
│  (Server Comp)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  fetchListings  │
│  (API call)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express API    │
│  GET /listings  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma Query   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
└────────┬────────┘
         │
    JSON Response
         │
         ▼
┌─────────────────┐
│  Render HTML    │
│  (SSR)          │
└────────┬────────┘
         │
    HTML Response
```

### 5.2 Add to Favorites (Client Component)

```
User Click
    │
    ▼
┌─────────────────┐
│  FavoriteButton │
│  (Client Comp)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  toggleFavorite │
│  (Zustand)      │
└────────┬────────┘
         │
         ├────► Optimistic UI update
         │
         ▼
┌─────────────────┐
│  POST /favorites│
│  (API call)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express API    │
│  Auth check     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma Create  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
└─────────────────┘
```

### 5.3 Create Listing (Multi-step)

```
User Submit (Step 4)
    │
    ▼
┌─────────────────┐
│  Sell Wizard    │
│  (Client Comp)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Zod Validation │
│  (Client-side)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  POST /listings │
│  with images    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express API    │
│  - Auth check   │
│  - Zod validate │
│  - Role check   │
│  - Limit check  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma Create  │
│  - Listing      │
│  - Images       │
│  (Transaction)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
└────────┬────────┘
         │
    201 Created
         │
         ▼
┌─────────────────┐
│  Email Service  │
│  (Async)        │
└─────────────────┘
```

---

## 6. Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Separate Express API** | Webhook handling, background jobs, independent scaling |
| **Next.js App Router** | SSR for SEO, Server Components reduce client JS |
| **JWT in HTTP-only cookies** | Secure, XSS-resistant, works across subdomains |
| **Prisma as single source** | Type safety, migrations, shared types |
| **Zustand over Redux** | Simpler API, less boilerplate, perfect for UI state |
| **Shadcn/ui** | Matches Figma, customizable, no vendor lock-in |
| **react-i18next** | Industry standard, supports all needed features |
| **Socket.io for messaging** | Real-time updates, fallback to polling |

---

**Last Updated:** 2026-02-19  
**Source:** Derived from `apps/web/` and `apps/api/` source code
