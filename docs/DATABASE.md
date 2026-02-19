# Database Schema

> Complete PostgreSQL schema documentation derived from `packages/database/prisma/schema.prisma`.

---

## Overview

- **Engine:** PostgreSQL 15+
- **ORM:** Prisma 5.14.0
- **Primary Key Strategy:** `cuid()` - URL-safe, sortable, collision-resistant
- **Soft Deletes:** Implemented via `deletedAt` timestamp (not all tables)
- **Full-Text Search:** Enabled via `fullTextSearch` preview feature

---

## Enums

### UserRole
```prisma
enum UserRole {
  USER              // Regular user: browse, message, create listings (max 5)
  DEALERSHIP        // Reserved for future dealership features
  ADMIN             // Full system access
  SUPPORT           // Limited admin access
}
```

**Role Details:**
- `USER`: Default role for all new registrations. Can browse listings, save favorites, send messages, and create up to 5 active listings.
- `DEALERSHIP`: Reserved for future implementation. Will enable unlimited listings and dealership profile features.
- `ADMIN`: Full access to all system resources and admin dashboard.
- `SUPPORT`: Limited admin access for customer support tasks.

**Guest Users (non-authenticated):**
- Can browse and view all listings
- Can contact sellers via email form
- Cannot use WebSocket messaging
- Cannot create listings

### ListingStatus
```prisma
enum ListingStatus {
  DRAFT     // Being created, not visible
  PENDING   // Submitted, awaiting verification
  ACTIVE    // Verified and visible
  SOLD      // Purchased via platform
  REJECTED  // Failed verification
  EXPIRED   // Auto-expired after time limit
}
```

### PaymentStatus
```prisma
enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

### InspectionStatus
```prisma
enum InspectionStatus {
  PENDING
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### CampaignStatus (Ad System)
```prisma
enum CampaignStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}
```

### AdUnitType
```prisma
enum AdUnitType {
  BANNER
  NATIVE
  ADSENSE
}
```

### AdEventType
```prisma
enum AdEventType {
  IMPRESSION
  CLICK
}
```

---

## Tables

### User
Central entity for all authenticated users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `email` | String | Unique | User email address |
| `passwordHash` | String? | | bcrypt hash (null for OAuth) |
| `name` | String? | | Display name |
| `phone` | String? | | Contact phone |
| `image` | String? | | Profile photo or logo URL |
| `coverImage` | String? | | Dealership background |
| `bio` | String? | Text | User/dealership description |
| `website` | String? | | Dealership website |
| `address` | String? | | Physical address |
| `openingHours` | String? | | Business hours |
| `role` | UserRole | Default: USER | User role |
| `dealershipId` | String? | | Self-reference for dealership |
| `emailVerified` | DateTime? | | Email verification timestamp |
| `deletedAt` | DateTime? | | Soft delete timestamp |
| `createdAt` | DateTime | Default: now() | Account creation |
| `updatedAt` | DateTime | Auto-update | Last modification |

**Relationships:**
- `listings` → Listing[]
- `favorites` → Favorite[]
- `messagesSent` → Message[] (as sender)
- `messagesReceived` → Message[] (as recipient)
- `sessions` → Session[]
- `gdprConsent` → GdprConsent?
- `savedSearches` → SavedSearch[]
- `reviewsGiven` → Review[] (as reviewer)
- `reviewsReceived` → Review[] (as target)
- `inspections` → VehicleInspection[]
- `buyerPayments` → Payment[] (as buyer)
- `sellerPayments` → Payment[] (as seller)
- `adCampaigns` → AdCampaign[]

**Indexes:**
- `@@index([deletedAt])` - Soft delete queries
- `@@index([email, deletedAt])` - Login lookups

---

### Listing
Central model for vehicle listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `userId` | String | FK → User.id | Listing owner |
| `status` | ListingStatus | Default: PENDING | Publication status |
| `make` | String | | Vehicle manufacturer |
| `model` | String | | Vehicle model |
| `variant` | String? | | Trim/variant |
| `year` | Int | | Manufacturing year |
| `vin` | String? | Unique | Vehicle identification number |
| `mileage` | Int | | Kilometers driven |
| `price` | Decimal | Decimal(10,2) | Price in EUR |
| `priceVatIncluded` | Boolean | Default: true | VAT status |
| `currency` | String | Default: "EUR" | Currency code |
| `bodyType` | String | | Sedan, SUV, etc. |
| `fuelType` | String | | Petrol, Diesel, Electric, Hybrid |
| `transmission` | String | | Manual, Automatic |
| `powerKw` | Int | | Engine power in kW |
| `driveType` | String? | | FWD, RWD, AWD, 4WD |
| `doors` | Int? | | Number of doors |
| `seats` | Int? | | Number of seats |
| `colorExterior` | String | | Exterior color |
| `colorInterior` | String? | | Interior color |
| `condition` | String | | New, Used, etc. |
| `description` | String? | Text | Detailed description |
| `features` | Json | | Flexible equipment storage |
| `registrationDate` | DateTime? | | First registration |
| `location` | String | | City/region in Estonia |
| `viewCount` | Int | Default: 0 | Number of views |
| `favoriteCount` | Int | Default: 0 | Number of favorites |
| `verifiedAt` | DateTime? | | Admin verification timestamp |
| `publishedAt` | DateTime? | | Publication timestamp |
| `deletedAt` | DateTime? | | Soft delete timestamp |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | Auto-update | Last modification |

**Relationships:**
- `user` → User
- `images` → ListingImage[]
- `favorites` → Favorite[]
- `messages` → Message[]
- `reviews` → Review[]
- `inspections` → VehicleInspection[]
- `payments` → Payment[]
- `sponsoredListings` → SponsoredListing[]

**Indexes:**
```prisma
@@index([make, model])
@@index([price])
@@index([year])
@@index([status, publishedAt])
@@index([userId, deletedAt])
@@index([deletedAt])
@@index([make, model, year, price, status])
@@index([location, status, publishedAt])
@@index([fuelType, status])
@@index([transmission, status])
@@index([bodyType, status])
@@index([mileage])
```

---

### ListingImage
Ordered photos for each listing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `listingId` | String | FK → Listing.id | Parent listing |
| `url` | String | | S3 URL |
| `order` | Int | | Display order (0, 1, 2...) |
| `verified` | Boolean | Default: false | Admin verified |
| `verifiedBy` | String? | | Admin user ID |
| `verifiedAt` | DateTime? | | Verification timestamp |
| `createdAt` | DateTime | Default: now() | Upload timestamp |
| `updatedAt` | DateTime | Auto-update | Last modification |

**Relationships:**
- `listing` → Listing (Cascade Delete)

**Indexes:**
```prisma
@@index([listingId, order])
```

---

### Favorite
Many-to-many between User and Listing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `userId` | String | FK → User.id | User who favorited |
| `listingId` | String | FK → Listing.id | Favorited listing |
| `createdAt` | DateTime | Default: now() | When favorited |

**Relationships:**
- `user` → User (Cascade Delete)
- `listing` → Listing (Cascade Delete)

**Constraints:**
```prisma
@@unique([userId, listingId])  // Prevent duplicate favorites
```

---

### Message
User-to-user messaging (supports anonymous).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `senderId` | String? | FK → User.id | Sender (null = anonymous) |
| `recipientId` | String | FK → User.id | Recipient (required) |
| `listingId` | String? | FK → Listing.id | Related listing |
| `subject` | String? | | Message subject |
| `body` | String | Text | Message content |
| `read` | Boolean | Default: false | Read status |
| `deletedAt` | DateTime? | | Soft delete |
| `createdAt` | DateTime | Default: now() | Sent timestamp |

**Relationships:**
- `sender` → User? (as SentMessages)
- `recipient` → User (as ReceivedMessages)
- `listing` → Listing?

**Indexes:**
```prisma
@@index([recipientId, read])   // Unread count queries
@@index([senderId])
@@index([deletedAt])
```

---

### Payment
Stripe payment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `listingId` | String | FK → Listing.id | Purchased listing |
| `buyerId` | String | FK → User.id | Buyer |
| `sellerId` | String | FK → User.id | Seller |
| `amount` | Decimal | Decimal(10,2) | Payment amount |
| `currency` | String | Default: "EUR" | Currency code |
| `stripePaymentId` | String | Unique | Stripe payment intent ID |
| `status` | PaymentStatus | Default: PENDING | Payment status |
| `createdAt` | DateTime | Default: now() | Created timestamp |
| `completedAt` | DateTime? | | Completion timestamp |

**Relationships:**
- `listing` → Listing
- `buyer` → User (as BuyerPayments)
- `seller` → User (as SellerPayments)

**Indexes:**
```prisma
@@index([buyerId])
@@index([sellerId])
@@index([listingId])
```

---

### GdprConsent
GDPR compliance tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `userId` | String | Unique, FK → User.id | User |
| `marketing` | Boolean | Default: false | Marketing consent |
| `analytics` | Boolean | Default: false | Analytics consent |
| `consentDate` | DateTime | Default: now() | When consent given |
| `ipAddress` | String? | | IP at time of consent |

**Relationships:**
- `user` → User

**Indexes:**
```prisma
@@index([ipAddress])
```

---

### Session
NextAuth session storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `sessionToken` | String | Unique | Session token |
| `userId` | String | FK → User.id | User |
| `expires` | DateTime | | Session expiration |
| `createdAt` | DateTime | Default: now() | Created |
| `updatedAt` | DateTime | Auto-update | Last modified |

**Relationships:**
- `user` → User (Cascade Delete)

---

### SavedSearch
User saved search criteria.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `userId` | String | FK → User.id | Owner |
| `name` | String | | Search name |
| `filters` | Json | | Stored filter criteria |
| `emailAlerts` | Boolean | Default: false | Alert enabled |
| `lastNotified` | DateTime? | | Last alert sent |
| `createdAt` | DateTime | Default: now() | Created |
| `updatedAt` | DateTime | Auto-update | Last modified |

**Relationships:**
- `user` → User (Cascade Delete)

**Indexes:**
```prisma
@@index([userId])
```

---

### Review
User reviews for sellers/listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `reviewerId` | String | FK → User.id | Review author |
| `targetId` | String | FK → User.id | Seller being reviewed |
| `listingId` | String? | FK → Listing.id | Related listing |
| `rating` | Int | | 1-5 stars |
| `title` | String? | | Review title |
| `body` | String | Text | Review content |
| `verified` | Boolean | Default: false | Verified purchase |
| `createdAt` | DateTime | Default: now() | Created |
| `updatedAt` | DateTime | Auto-update | Last modified |

**Relationships:**
- `reviewer` → User (as ReviewsGiven)
- `target` → User (as ReviewsReceived)
- `listing` → Listing?

**Constraints:**
```prisma
@@unique([reviewerId, targetId, listingId])  // One review per transaction
```

**Indexes:**
```prisma
@@index([targetId])
@@index([rating])
```

---

### VehicleInspection
Vehicle inspection requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `listingId` | String | FK → Listing.id | Vehicle to inspect |
| `requesterId` | String | FK → User.id | Requesting user |
| `status` | InspectionStatus | Default: PENDING | Inspection status |
| `inspectorNotes` | String? | Text | Inspector findings |
| `reportUrl` | String? | | S3 link to PDF report |
| `scheduledAt` | DateTime? | | Scheduled time |
| `completedAt` | DateTime? | | Completion time |
| `createdAt` | DateTime | Default: now() | Requested |
| `updatedAt` | DateTime | Auto-update | Last modified |

**Relationships:**
- `listing` → Listing
- `requester` → User

**Indexes:**
```prisma
@@index([listingId])
@@index([requesterId])
```

---

### Newsletter
Newsletter subscribers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `email` | String | Unique | Subscriber email |
| `language` | String | Default: "et" | Preferred language |
| `active` | Boolean | Default: true | Subscription status |
| `token` | String | Unique, Default: cuid() | Unsubscribe token |
| `createdAt` | DateTime | Default: now() | Subscribed |

**Indexes:**
```prisma
@@index([active])
```

---

### PasswordResetToken
Password reset token storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `email` | String | | User email |
| `token` | String | Unique | Reset token |
| `expires` | DateTime | | Token expiration |
| `used` | Boolean | Default: false | Token used flag |
| `createdAt` | DateTime | Default: now() | Created |

**Indexes:**
```prisma
@@index([email])
@@index([token])
@@index([expires])
```

---

## Ad System Tables

### AdCampaign
Advertising campaigns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `advertiserId` | String | FK → User.id | Campaign owner |
| `name` | String | | Campaign name |
| `budget` | Decimal | Decimal(10,2) | Total budget |
| `dailyBudget` | Decimal | Decimal(10,2) | Daily spend limit |
| `spent` | Decimal | Default: 0 | Amount spent |
| `startDate` | DateTime | | Campaign start |
| `endDate` | DateTime | | Campaign end |
| `status` | CampaignStatus | Default: DRAFT | Campaign status |
| `priority` | Int | Default: 3 | 1=Takeover, 2=House, 3=Programmatic |
| `targeting` | Json | Default: "{}" | Targeting criteria |
| `createdAt` | DateTime | Default: now() | Created |
| `updatedAt` | DateTime | Auto-update | Last modified |

**Relationships:**
- `advertiser` → User
- `advertisements` → Advertisement[]
- `sponsoredListings` → SponsoredListing[]

**Indexes:**
```prisma
@@index([status, startDate, endDate])
@@index([advertiserId])
@@index([priority, status])
```

---

### AdUnit
Ad placement definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `name` | String | | Placement name |
| `placementId` | String | Unique | External ID (e.g., "homepage-hero") |
| `type` | AdUnitType | Default: BANNER | Ad type |
| `width` | Int | | Width in pixels |
| `height` | Int | | Height in pixels |
| `description` | String? | | Description |
| `active` | Boolean | Default: true | Enabled flag |
| `createdAt` | DateTime | Default: now() | Created |
| `updatedAt` | DateTime | Auto-update | Last modified |

**Relationships:**
- `advertisements` → Advertisement[]

**Indexes:**
```prisma
@@index([placementId, active])
```

---

### Advertisement
Individual ads.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `campaignId` | String | FK → AdCampaign.id | Parent campaign |
| `adUnitId` | String | FK → AdUnit.id | Placement |
| `title` | String | | Ad title |
| `imageUrl` | String? | | Desktop image |
| `imageUrlMobile` | String? | | Mobile image |
| `linkUrl` | String? | | Click destination |
| `adSenseSnippet` | String? | Text | AdSense code |
| `active` | Boolean | Default: true | Enabled flag |
| `createdAt` | DateTime | Default: now() | Created |
| `updatedAt` | DateTime | Auto-update | Last modified |

**Relationships:**
- `campaign` → AdCampaign (Cascade Delete)
- `adUnit` → AdUnit
- `analytics` → AdAnalytics[]

**Indexes:**
```prisma
@@index([campaignId, active])
@@index([adUnitId, active])
```

---

### AdAnalytics
Ad performance tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `advertisementId` | String | FK → Advertisement.id | Related ad |
| `eventType` | AdEventType | | IMPRESSION or CLICK |
| `userId` | String? | | User who triggered event |
| `device` | String? | | Device type |
| `locale` | String? | | User locale |
| `ipHash` | String? | | Hashed IP (privacy) |
| `metadata` | Json | Default: "{}" | Additional data |
| `createdAt` | DateTime | Default: now() | Event timestamp |

**Relationships:**
- `advertisement` → Advertisement (Cascade Delete)

**Indexes:**
```prisma
@@index([advertisementId, eventType])
@@index([createdAt])
@@index([advertisementId, createdAt])
```

---

### SponsoredListing
Promoted listings in search results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique identifier |
| `listingId` | String | FK → Listing.id | Promoted listing |
| `campaignId` | String | FK → AdCampaign.id | Funding campaign |
| `boostMultiplier` | Float | Default: 1.0 | Search ranking boost |
| `active` | Boolean | Default: true | Enabled flag |
| `createdAt` | DateTime | Default: now() | Created |
| `updatedAt` | DateTime | Auto-update | Last modified |

**Relationships:**
- `listing` → Listing (Cascade Delete)
- `campaign` → AdCampaign (Cascade Delete)

**Constraints:**
```prisma
@@unique([listingId, campaignId])
```

**Indexes:**
```prisma
@@index([active, campaignId])
```

---

## Entity Relationship Diagram

```
User ──┬── Listing ──── ListingImage
       │       │
       │       ├── Favorite
       │       │
       │       ├── Message
       │       │
       │       ├── Payment
       │       │
       │       ├── Review
       │       │
       │       ├── VehicleInspection
       │       │
       │       └── SponsoredListing ─── AdCampaign
       │                                │
       ├── GdprConsent                  ├── Advertisement ─── AdAnalytics
       │                                │           │
       ├── Session                      │           └── AdUnit
       │                                │
       ├── SavedSearch                  └── (back to User as advertiser)
       │
       ├── Review (as reviewer/target)
       │
       ├── Payment (as buyer/seller)
       │
       ├── VehicleInspection (as requester)
       │
       └── Message (as sender/recipient)

Newsletter (standalone)

PasswordResetToken (standalone)
```

---

## Migration Workflow

```bash
# Create a new migration
cd packages/database
npx prisma migrate dev --name descriptive_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

---

## Seeding

Database seeding is defined in `packages/database/prisma/seed.ts`.

```bash
# Run seed script
npm run db:seed
```

---

**Last Updated:** 2026-02-19  
**Source:** `packages/database/prisma/schema.prisma`
