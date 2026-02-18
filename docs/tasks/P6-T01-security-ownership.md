# P6-T01: Security Hardening: Resource Ownership Verification

> **Phase:** 6 — Optimization & Hardening
> **Status:** ✅ Completed
> **Dependencies:** Phase 1, Phase 5
> **Estimated Time:** 3 hours

## Problem Statement

Currently, some API endpoints (specifically `PATCH /api/listings/:id` and `DELETE /api/listings/:id`) only check if a user is authenticated (`requireAuth`). They do NOT verify that the authenticated user is the actual OWNER of the listing or an ADMIN. This allows any logged-in user to potentially modify or delete listings belonging to others by simply knowing the listing ID.

## Implementation Steps

### Step 1: Create Ownership Verification Middleware

Create `apps/api/src/middleware/ownership.ts`:
- Implement `requireListingOwnership` middleware.
- Fetch the listing by ID.
- Compare `listing.userId` with `req.user.id`.
- Allow access if IDs match OR if `req.user.role === 'ADMIN'`.

### Step 2: Apply Middleware to Listing Routes

Update `apps/api/src/routes/listings.ts`:
- Apply `requireListingOwnership` to `PATCH /api/listings/:id`.
- Apply `requireListingOwnership` to `DELETE /api/listings/:id`.
- Apply `requireListingOwnership` to image management routes (`POST /:id/images`, `PATCH /:id/images/reorder`, `DELETE /:id/images/:imageId`).

### Step 3: Implement Ownership for Messages (Optional but Recommended)

Update `apps/api/src/routes/user.ts` (or messages router):
- Ensure users can only read/delete their own messages.

### Step 4: Add Unit Tests

Create `apps/api/src/__tests__/middleware/ownership.test.ts`:
- Test that owners can access their listings.
- Test that non-owners are rejected with `403 Forbidden`.
- Test that admins can access any listing.

## Acceptance Criteria

- [ ] `PATCH /api/listings/:id` returns 403 if the user is not the owner or an admin.
- [ ] `DELETE /api/listings/:id` returns 403 if the user is not the owner or an admin.
- [ ] Image management endpoints return 403 for non-owners.
- [ ] Unit tests pass for the ownership middleware.
- [ ] Admin users can still manage any listing.
