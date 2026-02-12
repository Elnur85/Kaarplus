# P1-T12: Admin Listing Verification Queue

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T05, P1-T07
> **Estimated Time:** 3 hours

## Objective

Build admin pages for reviewing pending listings and approving or rejecting them, including photo verification.

## Scope

### Backend Endpoints

- `GET /api/admin/listings/pending` — List pending listings (paginated)
- `PATCH /api/admin/listings/:id/verify` — Approve or reject
  - Input: `{ action: 'approve' | 'reject', reason?: string }`
  - On approve: set `verifiedAt`, `publishedAt`, status = ACTIVE
  - On reject: set status = REJECTED, send notification email

### Admin Pages

**Verification Queue (`/admin/listings`):**

- Table/list of pending listings
- Each row: thumbnail, title, seller name, submitted date, actions
- Click to expand full detail
- Approve / Reject buttons
- Reject requires reason text

**Listing Detail View (inline or modal):**

- All listing data
- All uploaded photos (full size)
- Photo check indicators
- Seller profile link

### Authorization

- Only `ADMIN` and `SUPPORT` roles can access
- Middleware check on all `/admin/*` routes

## Acceptance Criteria

- [ ] Admin can view list of pending listings
- [ ] Admin can approve a listing (sets status to ACTIVE)
- [ ] Admin can reject a listing with reason
- [ ] Rejected seller receives notification
- [ ] Non-admin users cannot access admin pages
- [ ] Approved listings appear in public search results

## Components to Create

```
app/admin/
├── layout.tsx (admin sidebar)
├── listings/
│   └── page.tsx
components/admin/
├── listing-queue.tsx
├── listing-review-card.tsx
└── reject-reason-modal.tsx
```
