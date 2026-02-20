# API Reference

> Complete API documentation derived from route files in `apps/api/src/routes/`.  
> Base URL: `http://localhost:4000` (dev) / `https://api.kaarplus.ee` (prod)

---

## Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response
```json
{
  "error": "Human-readable error message",
  "message": "Alias for frontend compatibility",
  "code": "ERROR_CODE",
  "details": {} // Optional, for validation errors
}
```

### Error Codes
| Code | HTTP | Meaning |
|------|------|---------|
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (duplicate) |
| `LISTING_NOT_FOUND` | 404 | Specific: Listing not found |
| `USER_NOT_FOUND` | 404 | Specific: User not found |
| `CAMPAIGN_NOT_FOUND` | 404 | Specific: Ad campaign not found |

---

## Authentication

All endpoints require authentication unless marked `[Public]`.  
JWT is passed via HTTP-only cookie (set on login) or `Authorization: Bearer <token>` header.

### Roles
| Role | Permissions |
|------|-------------|
| `USER` | Browse, favorites, messages, create listings (max 5) |
| `DEALERSHIP` | Reserved for future dealership features |
| `SUPPORT` | Verify listings, view users |
| `ADMIN` | Full access |

**Guest Users (non-authenticated):**
- Can browse listings and view details
- Can contact sellers via email form
- Cannot use WebSocket messaging
- Cannot create listings

---

## Endpoints by Domain

### Health

#### GET /api/health `[Public]`
Health check endpoint.

**Response 200:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-02-19T12:00:00.000Z"
}
```

---

### Auth (`/api/auth`)

All auth routes have rate limiting (10 req/min for auth, 5 req/min for password reset).

#### POST /api/auth/register `[Public]`
Create new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number

**Response 201:**
```json
{
  "user": {
    "id": "cl...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Errors:**
- `400` - Invalid email format
- `400` - Password doesn't meet requirements
- `400` - Email already exists

#### POST /api/auth/login `[Public]`
Authenticate user and set session cookie.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "cl...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Errors:**
- `401` - Invalid credentials

**Note:** Sets HTTP-only cookie `token` on success.

#### POST /api/auth/logout `[Public]`
Clear session cookie.

**Response 200:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/session
Get current user session.

**Auth Required:** Yes

**Response 200:**
```json
{
  "user": {
    "id": "cl...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### POST /api/auth/forgot-password `[Public]`
Request password reset email.

**Rate Limit:** 5 req/min (strict)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response 200:**
```json
{
  "message": "If an account exists, a password reset email has been sent."
}
```

**Security Note:** Always returns success to prevent email enumeration.

#### POST /api/auth/reset-password `[Public]`
Reset password with token.

**Rate Limit:** 5 req/min (strict)

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123"
}
```

**Password Requirements:** Same as register.

**Response 200:**
```json
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Errors:**
- `400` - Invalid or expired token
- `400` - Password doesn't meet requirements

#### POST /api/auth/change-password
Change password (authenticated).

**Auth Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass123"
}
```

**Response 200:**
```json
{
  "message": "Password changed successfully"
}
```

**Errors:**
- `401` - Current password incorrect

---

### Listings (`/api/listings`)

#### GET /api/listings `[Public]`
List all active listings with filters and pagination.

**Rate Limit:** 60 req/min

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 20, max: 50) |
| `sort` | string | `newest`, `oldest`, `price_asc`, `price_desc` |
| `make` | string | Filter by make (exact match) |
| `model` | string | Filter by model (exact match) |
| `yearMin` | number | Minimum year |
| `yearMax` | number | Maximum year |
| `priceMin` | number | Minimum price (EUR) |
| `priceMax` | number | Maximum price (EUR) |
| `fuelType` | string | Comma-separated fuel types |
| `transmission` | string | `manual`, `automatic` |
| `bodyType` | string | Body type filter |
| `color` | string | Exterior color |
| `location` | string | City/region |
| `q` | string | Full-text search query |

**Response 200:**
```json
{
  "data": [
    {
      "id": "cl...",
      "make": "Toyota",
      "model": "Corolla",
      "year": 2020,
      "price": 15000.00,
      "priceVatIncluded": true,
      "currency": "EUR",
      "mileage": 50000,
      "fuelType": "Petrol",
      "transmission": "Automatic",
      "bodyType": "Sedan",
      "location": "Tallinn",
      "status": "ACTIVE",
      "images": [
        { "id": "cl...", "url": "https://...", "order": 0 }
      ],
      "user": {
        "id": "cl...",
        "name": "Seller Name"
      },
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### GET /api/listings/metadata/filter-options `[Public]`
Get available filter options (makes, models, etc.).

**Rate Limit:** 60 req/min

**Response 200:**
```json
{
  "makes": ["Toyota", "BMW", "Audi"],
  "models": ["Corolla", "Camry", "X5"],
  "fuelTypes": ["Petrol", "Diesel", "Electric", "Hybrid"],
  "transmissions": ["Manual", "Automatic"],
  "bodyTypes": ["Sedan", "SUV", "Hatchback"],
  "colors": ["Black", "White", "Silver"],
  "locations": ["Tallinn", "Tartu", "Pärnu"]
}
```

#### GET /api/listings/metadata/featured `[Public]`
Get featured/promoted listings.

**Rate Limit:** 60 req/min

**Response 200:**
```json
{
  "data": [ /* Listing array */ ]
}
```

#### GET /api/listings/metadata/body-types `[Public]`
Get body type counts.

**Rate Limit:** 60 req/min

**Response 200:**
```json
{
  "data": [
    { "bodyType": "Sedan", "count": 150 },
    { "bodyType": "SUV", "count": 89 }
  ]
}
```

#### GET /api/listings/:id `[Public]`
Get single listing details.

**Rate Limit:** 60 req/min

**Response 200:**
```json
{
  "id": "cl...",
  "make": "Toyota",
  "model": "Corolla",
  "variant": "Hybrid",
  "year": 2020,
  "vin": "ABC123...",
  "mileage": 50000,
  "price": 15000.00,
  "priceVatIncluded": true,
  "currency": "EUR",
  "bodyType": "Sedan",
  "fuelType": "Hybrid",
  "transmission": "Automatic",
  "powerKw": 90,
  "driveType": "FWD",
  "doors": 4,
  "seats": 5,
  "colorExterior": "Silver",
  "colorInterior": "Black",
  "condition": "Used",
  "description": "Well maintained...",
  "features": { "aircon": true, "navigation": true },
  "location": "Tallinn",
  "viewCount": 150,
  "favoriteCount": 12,
  "status": "ACTIVE",
  "images": [
    { "id": "cl...", "url": "https://...", "order": 0, "verified": true }
  ],
  "user": {
    "id": "cl...",
    "name": "Seller Name",
    "image": "https://...",
    "dealershipId": null
  },
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Errors:**
- `404` - Listing not found

#### GET /api/listings/:id/similar `[Public]`
Get similar listings.

**Rate Limit:** 60 req/min

**Response 200:**
```json
{
  "data": [ /* Similar listings */ ]
}
```

#### POST /api/listings/:id/contact `[Public]`
Contact seller about listing.

**Rate Limit:** 10 req/min

**Request Body:**
```json
{
  "name": "Interested Buyer",
  "email": "buyer@example.com",
  "phone": "+372...",
  "message": "Is this still available?"
}
```

**Response 200:**
```json
{
  "message": "Message sent successfully"
}
```

**Note:** Can be used by guests (no auth required).

#### POST /api/listings
Create new listing.

**Auth Required:** Yes  
**Required Role:** `USER`, `DEALERSHIP`, or `ADMIN`  
**Rate Limit:** 10 req/min

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Corolla",
  "variant": "Hybrid",
  "year": 2020,
  "vin": "ABC123...",
  "mileage": 50000,
  "price": 15000,
  "priceVatIncluded": true,
  "bodyType": "Sedan",
  "fuelType": "Hybrid",
  "transmission": "Automatic",
  "powerKw": 90,
  "driveType": "FWD",
  "doors": 4,
  "seats": 5,
  "colorExterior": "Silver",
  "colorInterior": "Black",
  "condition": "Used",
  "description": "Well maintained...",
  "features": { "aircon": true, "navigation": true },
  "location": "Tallinn",
  "images": [
    { "url": "https://s3...", "order": 0 }
  ]
}
```

**Response 201:**
```json
{
  "data": { /* Created listing */ }
}
```

**Errors:**
- `400` - Validation error
- `403` - Individual seller limit reached (max 5)
- `409` - VIN already exists

#### PATCH /api/listings/:id
Update listing.

**Auth Required:** Yes  
**Required:** Owner or ADMIN  
**Rate Limit:** 10 req/min

**Request Body:** Same as create (all fields optional).

**Response 200:**
```json
{
  "data": { /* Updated listing */ }
}
```

**Errors:**
- `403` - Not owner or admin
- `404` - Listing not found

#### DELETE /api/listings/:id
Delete listing (soft delete).

**Auth Required:** Yes  
**Required:** Owner or ADMIN  
**Rate Limit:** 10 req/min

**Response 204:** No content

#### POST /api/listings/:id/images
Add images to listing.

**Auth Required:** Yes  
**Required:** Owner or ADMIN  
**Rate Limit:** 10 req/min

**Request Body:**
```json
{
  "images": [
    { "url": "https://s3...", "order": 0 },
    { "url": "https://s3...", "order": 1 }
  ]
}
```

#### PATCH /api/listings/:id/images/reorder
Reorder listing images.

**Auth Required:** Yes  
**Required:** Owner or ADMIN

**Request Body:**
```json
{
  "imageIds": ["id1", "id2", "id3"] // New order
}
```

#### DELETE /api/listings/:id/images/:imageId
Delete image from listing.

**Auth Required:** Yes  
**Required:** Owner or ADMIN

---

### Search (`/api/search`)

All search routes have rate limiting (60 req/min).

#### GET /api/search `[Public]`
Advanced search (same as GET /api/listings).

#### GET /api/search/makes `[Public]`
Get all makes with counts.

**Response 200:**
```json
{
  "data": [
    { "make": "Toyota", "count": 45 },
    { "make": "BMW", "count": 32 }
  ]
}
```

#### GET /api/search/models `[Public]`
Get models for a make.

**Query:** `?make=Toyota`

**Response 200:**
```json
{
  "data": [
    { "model": "Corolla", "count": 20 },
    { "model": "Camry", "count": 15 }
  ]
}
```

#### GET /api/search/filters `[Public]`
Get all filter options (same as /api/listings/metadata/filter-options).

#### GET /api/search/locations `[Public]`
Get all locations with counts.

#### GET /api/search/colors `[Public]`
Get all colors with counts.

#### GET /api/search/drive-types `[Public]`
Get all drive types with counts.

#### GET /api/search/stats `[Public]`
Get platform statistics.

**Response 200:**
```json
{
  "totalListings": 1500,
  "totalUsers": 500,
  "listingsToday": 12
}
```

---

### User (`/api/user`)

All user routes require authentication.

#### GET /api/user/profile
Get current user profile.

**Response 200:**
```json
{
  "id": "cl...",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+372...",
  "image": "https://...",
  "role": "USER",
  "dealershipId": null,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

#### PATCH /api/user/profile
Update profile.

**Request Body:**
```json
{
  "name": "New Name",
  "phone": "+372...",
  "image": "https://..."
}
```

#### GET /api/user/dashboard/stats
Get dashboard statistics.

**Response 200:**
```json
{
  "activeListings": 3,
  "totalViews": 150,
  "favorites": 12,
  "messages": 5
}
```

#### GET /api/user/listings
Get current user's listings.

**Response 200:**
```json
{
  "data": [ /* User's listings */ ]
}
```

### User Favorites

#### GET /api/user/favorites
Get user's favorite listings.

**Response 200:**
```json
{
  "data": [ /* Favorite listings */ ]
}
```

#### GET /api/user/favorites/ids
Get just the IDs of favorites.

**Response 200:**
```json
{
  "data": ["id1", "id2", "id3"]
}
```

#### GET /api/user/favorites/:listingId
Check if listing is favorited.

**Response 200:**
```json
{
  "isFavorite": true
}
```

#### POST /api/user/favorites/:listingId
Add to favorites.

**Response 201:**
```json
{
  "message": "Added to favorites"
}
```

**Errors:**
- `409` - Already favorited

#### DELETE /api/user/favorites/:listingId
Remove from favorites.

**Response 200:**
```json
{
  "message": "Removed from favorites"
}
```

### User Saved Searches

#### GET /api/user/saved-searches
Get saved searches.

#### POST /api/user/saved-searches
Create saved search.

**Request Body:**
```json
{
  "name": "Toyota under 15k",
  "filters": { "make": "Toyota", "priceMax": 15000 },
  "emailAlerts": true
}
```

#### PATCH /api/user/saved-searches/:id
Update saved search.

#### DELETE /api/user/saved-searches/:id
Delete saved search.

### User Inspections

#### POST /api/user/inspections
Request vehicle inspection.

**Request Body:**
```json
{
  "listingId": "cl..."
}
```

#### GET /api/user/inspections
Get my inspections.

#### GET /api/user/inspections/:id
Get inspection details.

### User Messages

#### GET /api/user/messages
Get conversations.

**Response 200:**
```json
{
  "data": [
    {
      "userId": "cl...",
      "userName": "Other User",
      "unreadCount": 2,
      "lastMessage": { ... }
    }
  ]
}
```

#### GET /api/user/messages/thread
Get message thread with user.

**Query:** `?userId=cl...&listingId=cl...`

#### GET /api/user/messages/unread-count
Get total unread count.

#### POST /api/user/messages
Send message.

**Request Body:**
```json
{
  "recipientId": "cl...",
  "listingId": "cl...", // Optional
  "body": "Message text"
}
```

#### PATCH /api/user/messages/mark-read
Mark messages as read.

**Request Body:**
```json
{
  "senderId": "cl..."
}
```

### User GDPR

#### POST /api/user/gdpr/consent
Save GDPR consent.

**Request Body:**
```json
{
  "marketing": true,
  "analytics": true
}
```

#### GET /api/user/gdpr/export
Export all user data (expensive operation).

**Rate Limit:** Standard read limit

**Response 200:** JSON dump of all user data.

#### DELETE /api/user/gdpr/delete
Delete user account.

**Response 200:**
```json
{
  "message": "Account scheduled for deletion"
}
```

---

### Admin (`/api/admin`)

All admin routes require `ADMIN` or `SUPPORT` role.

#### GET /api/admin/listings/pending
Get pending verification listings.

**Query:** `?page=1&pageSize=20`

#### PATCH /api/admin/listings/:id/verify
Verify/reject listing.

**Request Body:**
```json
{
  "status": "ACTIVE", // or "REJECTED"
  "rejectionReason": "..." // Required if REJECTED
}
```

#### GET /api/admin/users
Get all users.

**Query:** `?page=1&pageSize=20&role=USER`

#### GET /api/admin/analytics
Get platform analytics.

#### GET /api/admin/stats
Get quick stats.

### Admin Inspections

#### GET /api/admin/inspections
Get all vehicle inspection requests with pagination.

**Query:** `?page=1&pageSize=20&status=PENDING`

Valid status values: `PENDING`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

**Response:**
```json
{
  "data": [{ "id": "...", "status": "PENDING", "listing": {}, "requester": {} }],
  "meta": { "page": 1, "pageSize": 20, "total": 42 }
}
```

#### PATCH /api/admin/inspections/:id
Update inspection status. Service enforces valid state transitions:
- `PENDING` → `SCHEDULED` or `CANCELLED`
- `SCHEDULED` → `IN_PROGRESS` or `CANCELLED`
- `IN_PROGRESS` → `COMPLETED` or `CANCELLED`
- `COMPLETED` → (no further transitions)
- `CANCELLED` → (no further transitions)

**Request Body:**
```json
{
  "status": "SCHEDULED",
  "inspectorNotes": "Optional notes",
  "reportUrl": "https://s3.amazonaws.com/...",
  "scheduledAt": "2026-03-01T10:00:00+02:00"
}
```

On status change, a notification email is sent to the requester automatically.

### Admin Ad Campaigns

#### GET /api/admin/campaigns
Get ad campaigns.

#### POST /api/admin/campaigns
Create campaign.

**Request Body:**
```json
{
  "name": "Summer Sale",
  "budget": 1000,
  "dailyBudget": 50,
  "startDate": "2026-06-01",
  "endDate": "2026-08-31",
  "targeting": { "locations": ["Tallinn"] }
}
```

#### GET /api/admin/campaigns/:id
Get campaign details.

#### PATCH /api/admin/campaigns/:id
Update campaign.

#### DELETE /api/admin/campaigns/:id
Archive campaign.

#### GET /api/admin/campaigns/:id/analytics
Get campaign analytics.

### Admin Advertisements

#### POST /api/admin/advertisements
Create advertisement.

#### PATCH /api/admin/advertisements/:id
Update advertisement.

#### GET /api/admin/ad-units
Get all ad units.

#### GET /api/admin/ad-analytics/overview
Get ad analytics overview.

---

### Uploads (`/api/uploads`)

#### POST /api/uploads/presign
Get presigned URL for S3 upload.

**Auth Required:** Yes  
**Rate Limit:** 10 req/min

**Request Body:**
```json
{
  "filename": "car-photo.jpg",
  "contentType": "image/jpeg"
}
```

**Response 200:**
```json
{
  "uploadUrl": "https://s3-presigned-url",
  "fileUrl": "https://s3-final-url"
}
```

---

### Dealerships (`/api/dealerships`)

All routes have rate limiting (60 req/min).

#### GET /api/dealerships `[Public]`
Get all dealerships.

#### GET /api/dealerships/:id `[Public]`
Get dealership details.

---

### Reviews (`/api/reviews`)

#### GET /api/reviews `[Public]`
Get seller reviews.

**Query:** `?targetId=cl...`

#### GET /api/reviews/stats `[Public]`
Get seller review statistics.

**Query:** `?targetId=cl...`

#### GET /api/reviews/featured `[Public]`
Get featured reviews.

#### POST /api/reviews
Create review.

**Auth Required:** Yes

**Request Body:**
```json
{
  "targetId": "cl...",
  "listingId": "cl...", // Optional
  "rating": 5,
  "title": "Great experience",
  "body": "..."
}
```

#### DELETE /api/reviews/:id
Delete review.

**Auth Required:** Yes (owner or admin)

---

### Newsletter (`/api/newsletter`)

#### POST /api/newsletter/subscribe `[Public]`
Subscribe to newsletter.

**Rate Limit:** 10 req/min

**Request Body:**
```json
{
  "email": "user@example.com",
  "language": "et"
}
```

#### GET /api/newsletter/unsubscribe `[Public]`
Unsubscribe from newsletter.

**Query:** `?token=unsubscribe-token`

---

### Webhooks (`/api/webhooks`)

#### POST /api/webhooks/stripe `[Public]`
Stripe webhook handler.

**Note:** Signature verified in controller. Rate limited (100 req/min).

---

### Content Blocks (`/api/content-blocks`)

Ad serving endpoints.

#### GET /api/content-blocks/sponsored/listings `[Public]`
Get sponsored listings for search results.

#### GET /api/content-blocks/:placementId `[Public]`
Get active ad for placement.

#### POST /api/content-blocks/:id/engage `[Public]`
Track ad event (impression/click).

**Request Body:**
```json
{
  "eventType": "CLICK" // or "IMPRESSION"
}
```

---

### Payments (`/api/payments`)

#### POST /api/payments/create-intent
Create Stripe PaymentIntent.

**Auth Required:** Yes

---

### Mobile (`/api/mobile`)

#### GET /api/mobile/version `[Public]`
Get mobile app version info.

---

### Debug (`/api/debug`)

**Note:** Only available in non-production environments.

#### GET /api/debug/sentry
Test Sentry error reporting.

---

## Rate Limits Summary

| Endpoint Pattern | Limit | Notes |
|-----------------|-------|-------|
| `/api/auth/*` | 10 req/min | Login/register |
| `/api/auth/forgot-password` | 5 req/min | Stricter |
| `/api/auth/reset-password` | 5 req/min | Stricter |
| `/api/listings` (GET) | 60 req/min | Public browsing |
| `/api/listings` (POST/PATCH/DELETE) | 10 req/min | Write operations |
| `/api/search/*` | 60 req/min | Search operations |
| `/api/user/*` | 30 req/min | Authenticated |
| `/api/admin/*` | 30 req/min | Admin operations |
| `/api/uploads/*` | 10 req/min | File operations |
| `/api/webhooks/*` | 100 req/min | External services |
| All other | 30 req/min | Default |

---

**Last Updated:** 2026-02-19  
**Source:** `apps/api/src/routes/*.ts`
