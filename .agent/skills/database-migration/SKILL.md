---
name: database-migration
description: Creates and manages Prisma database migrations for the Kaarplus PostgreSQL database. Handles schema changes, migration generation, and safe deployment procedures with rollback plans.
triggers:
  - "Create migration"
  - "Database migration"
  - "Prisma migration"
  - "Schema change"
  - "Add table"
  - "Add column"
  - "Modify database"
---

# Database Migration Skill

## Goal
Safely create and manage database schema changes using Prisma migrations.

## Prerequisites
- Review existing schema in `packages/database/prisma/schema.prisma`
- Understand data relationships
- Plan for backward compatibility (if production)

## Migration Workflow

### Step 1: Plan the Change

**Before modifying schema:**
- [ ] Identify affected tables
- [ ] Check for existing data that needs migration
- [ ] Plan for backward compatibility
- [ ] Consider index requirements
- [ ] Document breaking changes

### Step 2: Modify Schema

Edit `packages/database/prisma/schema.prisma`:

```prisma
// Adding a new model
model VehicleFeature {
  id          String   @id @default(cuid())
  listingId   String
  feature     String
  description String?
  createdAt   DateTime @default(now())
  
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  @@index([listingId])
}

// Update existing model
model Listing {
  // ... existing fields
  
  // Add new field
  inspectionReport String?  // URL to inspection PDF
  
  // Add relation
  features VehicleFeature[]
}

// Adding enum
enum InspectionStatus {
  PENDING
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### Step 3: Generate Migration

```bash
cd packages/database

# Generate migration (development)
npx prisma migrate dev --name add_vehicle_features

# Or create migration without applying (for review)
npx prisma migrate dev --name add_vehicle_features --create-only
```

### Step 4: Review Migration

Check generated SQL in:
```
packages/database/prisma/migrations/20240115120000_add_vehicle_features/migration.sql
```

**Verify:**
- [ ] SQL looks correct
- [ ] No unintended changes
- [ ] Proper indexes created
- [ ] Foreign keys have ON DELETE rules

### Step 5: Apply Migration

```bash
# Development
npx prisma migrate dev

# Staging/Production
npx prisma migrate deploy
```

### Step 6: Generate Prisma Client

```bash
npx prisma generate
```

### Step 7: Verify in Prisma Studio

```bash
npx prisma studio
```

## Common Migration Patterns

### Adding a New Table

```prisma
model SavedSearch {
  id          String   @id @default(cuid())
  userId      String
  name        String
  filters     Json     // Stored filter criteria
  emailAlerts Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

### Adding a Column

```prisma
model Listing {
  // ... existing fields
  
  // Add nullable column (safe for existing data)
  vin String? @unique
  
  // Add column with default (for required fields)
  viewCount Int @default(0)
}
```

### Adding an Enum

```prisma
enum NotificationType {
  LISTING_CREATED
  LISTING_SOLD
  MESSAGE_RECEIVED
  PRICE_DROP
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  message   String
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, read])
}
```

### Adding Indexes

```prisma
model Listing {
  // ... fields
  
  // Single column index
  @@index([status])
  
  // Composite index
  @@index([make, model])
  
  // Index for sorting
  @@index([createdAt])
  
  // Index for common query pattern
  @@index([status, publishedAt])
}
```

### Adding Relations

```prisma
model Listing {
  // ... fields
  
  // One-to-many relation
  images ListingImage[]
  
  // Many-to-many through explicit table
  favoritedBy Favorite[]
}

model ListingImage {
  id        String  @id @default(cuid())
  listingId String
  url       String
  order     Int
  
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  @@index([listingId, order])
}
```

## Safe Migration Practices

### For Production Deployments

#### 1. Backward Compatible Changes (Preferred)

```prisma
// ✅ Safe: Add nullable column
newField String?

// ✅ Safe: Add new table
model NewTable { }

// ✅ Safe: Add index
@@index([field])
```

#### 2. Breaking Changes (Require Care)

```prisma
// ⚠️ Breaking: Make nullable column required
// First deploy: Add with default
requiredField String @default("")
// Second deploy: Remove default, add NOT NULL

// ⚠️ Breaking: Drop column
// First deploy: Stop using column in code
// Second deploy: Drop column from schema

// ⚠️ Breaking: Rename column
// Use @map to maintain database column name
newName String @map("old_name")
```

### Migration Rollback Procedure

If migration fails in production:

```bash
# 1. Check migration status
npx prisma migrate status

# 2. If not deployed, mark as rolled back
npx prisma migrate resolve --rolled-back "20240115120000_migration_name"

# 3. If already applied, create revert migration
# Create new migration that undoes changes

# 4. For emergency, restore from backup
pg_restore --dbname=kaarplus_prod backup.sql
```

## Data Migration

### Seeding New Data

```typescript
// prisma/seed.ts
import { prisma } from '../src/client';

async function main() {
  // Migrate existing data
  const listings = await prisma.listing.findMany();
  
  for (const listing of listings) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        // Set default values for new fields
        viewCount: 0,
      },
    });
  }
}

main();
```

### Run Seed

```bash
npx prisma db seed
```

## Examples

### Example 1: Add Review System

**User Request:** "Add a review system for sellers"

**Schema Changes:**
```prisma
model Review {
  id          String   @id @default(cuid())
  reviewerId  String
  targetId    String   // seller being reviewed
  listingId   String?
  rating      Int      // 1-5
  title       String?
  body        String   @db.Text
  verified    Boolean  @default(false) // verified purchase
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  reviewer User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  target   User     @relation("ReviewsReceived", fields: [targetId], references: [id])
  listing  Listing? @relation(fields: [listingId], references: [id])
  
  @@unique([reviewerId, listingId])
  @@index([targetId])
}

model User {
  // ... existing fields
  
  reviewsGiven    Review[] @relation("ReviewsGiven")
  reviewsReceived Review[] @relation("ReviewsReceived")
}

model Listing {
  // ... existing fields
  
  reviews Review[]
}
```

**Migration Commands:**
```bash
cd packages/database
npx prisma migrate dev --name add_review_system
npx prisma generate
```

### Example 2: Add Soft Delete

**User Request:** "Add soft delete for listings"

**Schema Changes:**
```prisma
model Listing {
  // ... existing fields
  
  deletedAt DateTime?  // Null = not deleted
  
  @@index([deletedAt])
}
```

**Update Queries:**
```typescript
// Instead of delete
await prisma.listing.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// Filter in queries
await prisma.listing.findMany({
  where: {
    deletedAt: null,  // Only non-deleted
    // ... other filters
  },
});
```

## Constraints

### DO
- [ ] Always create migrations (never use `db push` in production)
- [ ] Review generated SQL before applying
- [ ] Test migrations on staging first
- [ ] Back up database before production migration
- [ ] Use transactions for data migrations
- [ ] Add indexes for frequently queried fields
- [ ] Use @map for renaming to avoid data loss

### DON'T
- [ ] Don't modify existing migrations after sharing
- [ ] Don't delete migration files that have been applied
- [ ] Don't use `db pull` in production
- [ ] Don't skip migration testing
- [ ] Don't forget to generate client after migration
