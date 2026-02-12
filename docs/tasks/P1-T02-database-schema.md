# P1-T02: Database Schema & Prisma Setup

> **Phase:** 1 — Core MVP
> **Status:** ✅ Complete
> **Dependencies:** P1-T01
> **Estimated Time:** 2 hours

## Objective

Set up the Prisma ORM in `packages/database` with the full schema defined in `docs/DATABASE.md`, generate the Prisma client, create initial migrations, and optionally add a seed script.

## Scope

### 1. Prisma Installation & Configuration

In `packages/database`:

- Install `prisma` (dev) and `@prisma/client`
- Create `prisma/schema.prisma` with the full schema
- Configure for PostgreSQL with `cuid()` IDs

### 2. Schema Implementation

Implement ALL models from `docs/DATABASE.md`:

**Models:**

- `User` — with role enum, relations to listings/favorites/messages
- `Listing` — core vehicle listing with JSONB features, all specs
- `ListingImage` — ordered photos with verification flag
- `Favorite` — user-listing many-to-many
- `Message` — sender/recipient with listing context
- `Payment` — Stripe payment records
- `GdprConsent` — one-to-one with User

**Enums:**

- `UserRole` (BUYER, INDIVIDUAL_SELLER, DEALERSHIP, ADMIN, SUPPORT)
- `ListingStatus` (DRAFT, PENDING, ACTIVE, SOLD, REJECTED, EXPIRED)
- `PaymentStatus` (PENDING, COMPLETED, FAILED, REFUNDED)

**Indexes:**

- `[make, model]` on Listing
- `[price]` on Listing
- `[year]` on Listing
- `[status, publishedAt]` on Listing
- Full-text on `[make, model, description]`
- `[listingId, order]` on ListingImage
- Unique `[userId, listingId]` on Favorite
- `[recipientId, read]` on Message

### 3. Database Package Exports

`packages/database/index.ts`:

```typescript
export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';
```

Singleton pattern for Prisma client to avoid hot-reload issues.

### 4. Seed Script

Create `prisma/seed.ts` with:

- 2 admin users, 2 dealers, 3 individual sellers, 5 buyers
- 20-30 sample car listings with realistic Estonian data
- Sample images (URLs to placeholder images)
- A few favorites and messages

### 5. Environment Setup

- `.env.example` in `packages/database` with `DATABASE_URL` template
- Instructions for local PostgreSQL setup

## Acceptance Criteria

- [ ] `npx prisma generate` succeeds
- [ ] `npx prisma migrate dev` creates the initial migration
- [ ] `npx prisma db seed` populates the database with sample data
- [ ] Prisma client can be imported from `packages/database`
- [ ] All indexes are properly defined
- [ ] Full-text search index works on listings

## Files to Create/Modify

```
packages/database/package.json (update)
packages/database/prisma/schema.prisma
packages/database/prisma/seed.ts
packages/database/src/index.ts
packages/database/src/client.ts
packages/database/tsconfig.json
packages/database/.env.example
```
