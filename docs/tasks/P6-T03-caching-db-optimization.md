# P6-T03: Caching & DB Index Optimization

> **Phase:** 6 — Optimization & Hardening
> **Status:** ✅ Completed
> **Dependencies:** Phase 1
> **Estimated Time:** 3 hours

## Objective
- [x] Implement in-memory cache utility with TTL and pattern invalidation
- [x] Cache filter options and static data (1h TTL)
- [x] Cache search results and listing details (5-10m TTL)
- [x] Implement cache invalidation on listing mutations
- [x] Add database indexes for frequently filtered columns
- [x] Optimize data retrieval with efficient Prisma selection sets. This includes implementing a caching layer for expensive search queries and adding missing database indexes.

## Requirements

### 1. Database Index Optimization
- [x] Review current query patterns in `ListingService` and `SearchService`.
- [x] Add indexes for remaining frequently filtered columns in `Listing` model:
    - `fuelType`
    - `transmission`
    - `bodyType`
    - `driveType`
    - `condition`
- [x] Implement GIN index for JSONB `features` column for faster equipment-based searches if needed.
- [x] Verify index usage using `EXPLAIN ANALYZE` or Prisma's query logging.

### 2. API Caching
- [x] **In-memory Caching Utility**
    - [x] Create simple cache with TTL and pattern invalidation.
- [x] **Filter Options Caching**
    - [x] Cache makes, models, locations, colors, etc., in `SearchService`.
- [x] **Search & Detail Caching**
    - [x] Cache search results and individual listing data in `ListingService`.
- [x] **Cache Invalidation**
    - [x] Clear search cache when listings are updated/added/deleted.
- [x] **Database Indexing**
    - [x] Add indexes to `Listing` model for `fuelType`, `transmission`, `bodyType`, etc.
- [x] **Query Optimization**
    - [x] Use Prisma select to fetch only necessary fields for search results.
- [x] **Admin Dashboard Optimization**
    - [x] Cache admin stats and invalidate search cache on listing verification.

### 3. Code-Level Enhancements
- [x] Ensure all `findMany` calls use `select` to only retrieve required fields.
- [x] Optimize the `count` query in `getAllListings` which can be expensive on large datasets.

## Technical Details
- **Backend Service**: `apps/api/src/services/listingService.ts` and `apps/api/src/services/searchService.ts`.
- **Caching Layer**: `node-cache` or a custom LRU implementation.
- **Database**: Prisma migrations.

## Acceptance Criteria
- [ ] Search response times are under 200ms for majority of queries.
- [ ] All primary filter fields have corresponding database indexes.
- [ ] Cache is automatically invalidated or expires correctly when data changes.
- [ ] Unit tests verify that caching doesn't return stale data after updates.
