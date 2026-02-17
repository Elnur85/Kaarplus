---
title: Architecture Guidelines
description: Monorepo architecture, folder structure, and design patterns for Kaarplus. Defines the separation of concerns between frontend, backend, and shared packages.
triggers:
  - "*.ts"
  - "*.tsx"
  - "prisma/schema.prisma"
  - "package.json"
---

# Architecture Guidelines

## Monorepo Structure

```
kaarplus/
├── apps/
│   ├── web/                 # Next.js frontend (port 3000)
│   │   ├── app/             # App Router pages
│   │   │   ├── (auth)/      # Auth route group
│   │   │   ├── (public)/    # Public route group
│   │   │   ├── (protected)/ # Protected route group
│   │   │   ├── admin/       # Admin dashboard
│   │   │   ├── dashboard/   # User dashboard
│   │   │   └── api/         # API routes (auth)
│   │   ├── components/
│   │   │   ├── ui/          # Shadcn/ui components
│   │   │   ├── layout/      # Header, Footer
│   │   │   ├── listings/    # Listing-related
│   │   │   ├── auth/        # Auth forms
│   │   │   └── shared/      # Reusable components
│   │   ├── lib/
│   │   │   ├── api.ts       # API client
│   │   │   ├── utils.ts     # Utilities (cn, formatters)
│   │   │   └── stores/      # Zustand stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── schemas/         # Zod schemas
│   │   ├── types/           # TypeScript types
│   │   └── messages/        # i18n translations
│   └── api/                 # Express backend (port 4000)
│       ├── src/
│       │   ├── routes/      # Route definitions
│       │   ├── controllers/ # Request handling
│       │   ├── services/    # Business logic
│       │   ├── middleware/  # Auth, validation, rate limiting
│       │   ├── schemas/     # Zod validation schemas
│       │   ├── utils/       # Helpers (email, S3, stripe)
│       │   └── types/       # TypeScript interfaces
│       └── prisma/          # Database migrations
├── packages/
│   ├── database/            # Shared Prisma client & schema
│   ├── typescript-config/   # Shared TS configs
│   └── ui/                  # Shared UI components
├── docs/                    # Project documentation
├── e2e/                     # Playwright E2E tests
└── stitch/                  # Design reference (read-only)
```

## Key Architectural Decisions

### 1. Monorepo with npm Workspaces
- Shared types and Prisma client across apps
- Single source of truth for database schema
- Atomic deployments

### 2. Separate Express Backend
- Dedicated API server for business logic
- Handles webhooks, background jobs
- Independent scaling

### 3. Server Components First
- Leverage Next.js SSR for SEO-critical pages
- Listings, car details are Server Components
- Interactive elements are Client Components

### 4. Prisma as Single Source of Truth
- Schema generates types used by both frontend and backend
- Shared `@kaarplus/database` package
- Migration-based schema changes

### 5. JWT in HTTP-only Cookies
- Secure, cross-origin auth between web and API
- HttpOnly, Secure, SameSite=strict
- CSRF protection for state-changing operations

### 6. Zustand over Redux
- Simpler API for client state
- No boilerplate
- Perfect for filters, compare, favorites

### 7. Shadcn/ui for Design System
- Matches Figma designs
- Fully customizable
- No vendor lock-in

## Design Patterns

### Frontend Patterns

#### Container/Presentation Pattern
```typescript
// Server Component (Container)
export default async function ListingsPage({ searchParams }) {
  const listings = await fetchListings(searchParams);
  return <ListingGrid listings={listings} />;
}

// Client Component (Presentation)
"use client";
export function ListingGrid({ listings }) {
  return <div>{/* render listings */}</div>;
}
```

#### Custom Hooks Pattern
```typescript
// hooks/use-listings.ts
export function useListings(filters: FilterState) {
  const [listings, setListings] = useState([]);
  // fetch logic
  return { listings, loading, error };
}
```

#### Store Pattern (Zustand)
```typescript
// stores/use-filter-store.ts
export const useFilterStore = create<FilterState>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  reset: () => set({ filters: {} }),
}));
```

### Backend Patterns

#### Service Pattern
```typescript
// services/listingService.ts
export class ListingService {
  async getAllListings(query: ListingQuery) {
    // Business logic only
  }
}
```

#### Repository Pattern (via Prisma)
- Prisma Client acts as repository
- Services use Prisma for data access
- No separate repository layer needed

#### Middleware Pipeline Pattern
```typescript
// app.ts
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(authMiddleware);
app.use(validationMiddleware);
```

#### Error Handling Pattern
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

// Throw in service
throw new NotFoundError("Listing not found");

// Caught by errorHandler middleware
```

## Data Flow

### Server Component Flow
```
User Request → Next.js → Server Component → API Call → Express → Service → Prisma → PostgreSQL
                                    ↓
                              HTML Response (SSR)
```

### Client Component Flow
```
User Action → Client Component → API Client → Express → Service → Prisma → PostgreSQL
                                    ↓
                              JSON Response → State Update → Re-render
```

### Authentication Flow
```
Login → NextAuth → Express API → JWT Token → HTTP-only Cookie
                                    ↓
Subsequent Requests → Cookie → Express Middleware → req.user
```

## Security Architecture

### Authentication Layers
1. **Frontend**: NextAuth.js with JWT strategy
2. **Backend**: JWT verification middleware
3. **Database**: Row-level security via application logic

### Authorization Patterns
```typescript
// Role-based
requireRole(UserRole.ADMIN, UserRole.SUPPORT)

// Resource-based
if (!isAdmin && listing.userId !== userId) {
  throw new ForbiddenError("No permission");
}
```

### Data Protection
- Input validation with Zod (all endpoints)
- SQL injection protection (Prisma ORM)
- XSS protection (React escaping, CSP headers)
- CSRF protection (SameSite cookies)

## Performance Guidelines

### Frontend
- Server Components for initial render
- Image optimization with next/image
- Lazy load below-fold content
- Route prefetching

### Backend
- Database query optimization (select only needed fields)
- Connection pooling (Prisma)
- Rate limiting (express-rate-limit)
- Response caching (Redis for future)

### Database
- Proper indexing (defined in schema)
- Query optimization (avoid N+1)
- Pagination for large datasets

## Scalability Considerations

### Horizontal Scaling Ready
- Stateless API design
- JWT auth (no server-side sessions)
- Database connection pooling

### Future Optimizations
- Redis for caching
- CDN for static assets
- Database read replicas
- Microservices for heavy workloads
