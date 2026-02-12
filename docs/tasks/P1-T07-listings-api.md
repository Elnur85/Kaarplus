# P1-T07: Listings API (CRUD + Filters + Search)

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T02, P1-T03
> **Estimated Time:** 4 hours

## Objective

Implement the core listings API endpoints with full CRUD operations, filtering, pagination, sorting, and full-text search.

## Scope

### Endpoints

| Method | Path                        | Auth        | Description                                |
| ------ | --------------------------- | ----------- | ------------------------------------------ |
| GET    | `/api/listings`             | Public      | List with filters, pagination, sorting     |
| GET    | `/api/listings/:id`         | Public      | Single listing with images and seller info |
| POST   | `/api/listings`             | Seller+     | Create new listing                         |
| PATCH  | `/api/listings/:id`         | Owner/Admin | Update listing                             |
| DELETE | `/api/listings/:id`         | Owner/Admin | Delete listing                             |
| GET    | `/api/listings/:id/similar` | Public      | Similar cars (same make/body type)         |
| POST   | `/api/listings/:id/contact` | Public      | Contact seller (email)                     |
| GET    | `/api/search/makes`         | Public      | Available makes (distinct)                 |
| GET    | `/api/search/models`        | Public      | Models for a given make                    |
| GET    | `/api/search/filters`       | Public      | All available filter options               |

### GET /api/listings — Query Parameters

- `page` (number, default: 1)
- `pageSize` (number, default: 20, max: 50)
- `sort` (newest, oldest, price_asc, price_desc)
- `make`, `model` (string)
- `yearMin`, `yearMax` (number)
- `priceMin`, `priceMax` (number)
- `fuelType` (comma-separated)
- `transmission` (manual, automatic)
- `bodyType` (string)
- `color` (string)
- `q` (full-text search query)
- `status` (default: ACTIVE for public, all for admin)

### Architecture

```
routes/listings.ts → controllers/listingController.ts → services/listingService.ts
```

- **Controller:** Parse request, call service, format response
- **Service:** Business logic, Prisma queries, authorization checks
- **Validation:** Zod schemas for create/update payloads

### Zod Schemas

- `createListingSchema` — all required fields for new listing
- `updateListingSchema` — partial, all fields optional
- `listingQuerySchema` — query parameter validation
- `contactSellerSchema` — name, email, message, phone (optional)

### Response Format

```typescript
// List response
{
  data: Listing[],
  meta: { page: number, pageSize: number, total: number, totalPages: number }
}

// Single listing response
{
  data: Listing & { images: ListingImage[], user: UserPublic }
}
```

## Acceptance Criteria

- [ ] All endpoints return correct responses
- [ ] Filtering works for all query parameters
- [ ] Pagination returns correct total count
- [ ] Full-text search works on make, model, description
- [ ] Only listing owners or admins can update/delete
- [ ] Creating a listing sets status to PENDING
- [ ] Similar cars endpoint returns relevant results
- [ ] View count increments on GET /:id
- [ ] All inputs validated with Zod
