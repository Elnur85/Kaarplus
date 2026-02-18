# P6-T03: Caching & DB Index Optimization

> **Phase:** 6 — Optimization & Hardening
> **Status:** ⬜ Not Started
> **Dependencies:** Phase 1
> **Estimated Time:** 3 hours

## Objective
Optimize API performance and database query efficiency to ensure a responsive user experience as the platform scales. This includes implementing a caching layer for expensive search queries and adding missing database indexes.

## Requirements

### 1. Database Index Optimization
- [ ] Review current query patterns in `ListingService` and `SearchService`.
- [ ] Add indexes for remaining frequently filtered columns in `Listing` model:
    - `fuelType`
    - `transmission`
    - `bodyType`
    - `driveType`
    - `condition`
- [ ] Implement GIN index for JSONB `features` column for faster equipment-based searches if needed.
- [ ] Verify index usage using `EXPLAIN ANALYZE` or Prisma's query logging.

### 2. API Caching
- [ ] Implement a simple in-memory caching utility in `apps/api/src/utils/cache.ts`.
- [ ] Cache static/slow-changing filter data (makes, models, locations, colors) in `SearchController`.
- [ ] Cache search result objects for public `/api/search` queries with a 5-minute TTL.
- [ ] Implement "stale-while-revalidate" or explicit invalidation when a listing is created, updated, or deleted.

### 3. Code-Level Enhancements
- [ ] Ensure all `findMany` calls use `select` to only retrieve required fields.
- [ ] Optimize the `count` query in `getAllListings` which can be expensive on large datasets.

## Technical Details
- **Backend Service**: `apps/api/src/services/listingService.ts` and `apps/api/src/services/searchService.ts`.
- **Caching Layer**: `node-cache` or a custom LRU implementation.
- **Database**: Prisma migrations.

## Acceptance Criteria
- [ ] Search response times are under 200ms for majority of queries.
- [ ] All primary filter fields have corresponding database indexes.
- [ ] Cache is automatically invalidated or expires correctly when data changes.
- [ ] Unit tests verify that caching doesn't return stale data after updates.
