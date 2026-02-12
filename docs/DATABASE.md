# Database Schema

## Overview

PostgreSQL 15+ with Prisma ORM. Schema lives in `packages/database/prisma/schema.prisma`.

## Entity Relationship

```
User ──┬── Listing ──── ListingImage
       │       │
       │       ├── Favorite
       │       │
       │       ├── Message
       │       │
       │       └── Payment
       │
       ├── GdprConsent
       │
       └── Session
```

## Core Models

### User

- Primary entity for all authenticated users
- `role` enum: BUYER, INDIVIDUAL_SELLER, DEALERSHIP, ADMIN, SUPPORT
- Optional `dealershipId` for linking to dealership profiles
- Cascading delete on related favorites and messages

### Listing

- Central model for vehicle listings
- `status` lifecycle: DRAFT → PENDING → ACTIVE → SOLD/REJECTED/EXPIRED
- `features` stored as JSONB for flexible equipment data
- `price` as Decimal(10,2) in EUR
- Full-text search index on `make`, `model`, `description`
- Composite indexes on common filter patterns: `[make, model]`, `[status, publishedAt]`

### ListingImage

- Ordered photos for each listing
- `verified` flag for admin approval workflow
- Cascade delete when listing is removed

### Favorite

- Many-to-many between User and Listing
- Unique constraint on `[userId, listingId]`

### Message

- Self-referencing User relations (sender, recipient)
- Optional listing context
- `read` flag for inbox management

### Payment

- Stripe integration record
- Links buyer, seller, and listing
- `stripePaymentId` unique constraint for idempotency

### GdprConsent

- One-to-one with User
- Tracks marketing and analytics consent
- Required for GDPR compliance

## Enums

```prisma
enum UserRole {
  BUYER
  INDIVIDUAL_SELLER
  DEALERSHIP
  ADMIN
  SUPPORT
}

enum ListingStatus {
  DRAFT
  PENDING
  ACTIVE
  SOLD
  REJECTED
  EXPIRED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

## Indexing Strategy

| Table        | Index                                 | Purpose                 |
| ------------ | ------------------------------------- | ----------------------- |
| Listing      | `[make, model]`                       | Filter by make/model    |
| Listing      | `[price]`                             | Price range queries     |
| Listing      | `[year]`                              | Year range queries      |
| Listing      | `[status, publishedAt]`               | Active listings feed    |
| Listing      | fulltext `[make, model, description]` | Search                  |
| ListingImage | `[listingId, order]`                  | Ordered photo retrieval |
| Favorite     | unique `[userId, listingId]`          | Prevent duplicates      |
| Message      | `[recipientId, read]`                 | Unread inbox queries    |
| Payment      | `[buyerId]`                           | Buyer payment history   |
| Payment      | `[sellerId]`                          | Seller payment history  |

## Migration Workflow

```bash
# Create a new migration
cd packages/database
npx prisma migrate dev --name <descriptive_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```
