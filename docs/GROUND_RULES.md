# GROUND RULES — Kaarplus

> **READ THIS FIRST.** At the start of every session, read this file in full before making any change to the codebase.

---

## 1. PROJECT IDENTITY

### What This Is
Kaarplus is a **premium car sales marketplace** for the Estonian market. It connects vehicle sellers (individuals and dealerships) with buyers through a feature-rich web platform.

### Tech Stack (Derived from package.json)
| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 15.0.0 |
| Frontend | React | 19.0.0 |
| Frontend | TypeScript | 5.4.5+ |
| Frontend | Tailwind CSS | 3.4.3 |
| Frontend | UI Library | Shadcn/ui + Radix |
| State | Client | Zustand |
| State | Server | React Server Components |
| Backend | Framework | Express.js 5.2.1 |
| Backend | Runtime | Node.js 20+ |
| Database | ORM | Prisma 5.14.0 |
| Database | Engine | PostgreSQL 15+ |
| Auth | JWT | jsonwebtoken 9.x |
| Validation | Schema | Zod 4.3.6 |
| i18n | Library | react-i18next 16.x |
| Testing | Unit | Vitest 4.x |
| Testing | E2E | Playwright 1.58+ |

### Monorepo Structure
```
kaarplus/
├── apps/
│   ├── web/                 # Next.js frontend (port 3000)
│   └── api/                 # Express backend (port 4000)
├── packages/
│   ├── database/            # Prisma schema + shared client
│   ├── typescript-config/   # Shared TS configs
│   └── ui/                  # Shared UI components (minimal)
├── docs/                    # Living documentation
├── .agent/                  # AI agent rules and workflows
├── e2e/                     # Playwright E2E tests
└── stitch/                  # Design reference files (read-only)
```

### Supported Languages
| Code | Language | Status |
|------|----------|--------|
| `et` | Estonian | Primary |
| `en` | English | Full support |
| `ru` | Russian | Full support |

**Every user-facing string must exist in all three languages.** No exceptions.

---

## 2. NON-NEGOTIABLE RULES

### Rule 1: No Hardcoded Domain Data
**Everything comes from the database.**

```typescript
// ❌ WRONG - Hardcoded options
const bodyTypes = ["Sedan", "SUV", "Hatchback"];

// ✅ CORRECT - From database
const bodyTypes = await prisma.listing.groupBy({ by: ['bodyType'] });
```

### Rule 2: No Silent Error Swallowing
**Every error must be surfaced or logged.**

```typescript
// ❌ WRONG - Silent failure
try {
  await api.post('/listings', data);
} catch (e) {
  // Nothing - user sees no feedback
}

// ✅ CORRECT - Error surfaced
import { logger } from '@/utils/logger';

try {
  await api.post('/listings', data);
} catch (error) {
  logger.error('Failed to create listing', { error, data });
  throw new AppError('Listing creation failed', 500);
}
```

### Rule 3: No User-Facing String Outside i18n
**All three locales must be complete.**

```typescript
// ❌ WRONG - Hardcoded text
<button>Submit</button>

// ✅ CORRECT - Translation key
<button>{t('actions.submit')}</button>
```

Translation files live in:
- `apps/web/messages/et/*.json`
- `apps/web/messages/en/*.json`
- `apps/web/messages/ru/*.json`

**CRITICAL Syntax Warning**: When interpolating variables into localization strings, ALWAYS use double curly braces `{{variable}}`, NOT single curly braces `{variable}`. Single braces will leak generic keys and fail to render in `react-i18next`.

### Rule 4: No Fix Without Verification
**Verify at every layer: DB → API → UI**

When fixing a bug:
1. Write a test that reproduces the bug
2. Fix at the lowest layer (usually DB or service)
3. Verify API response is correct
4. Verify UI displays correctly
5. Run the test to confirm fix

### Rule 5: No New Pattern When Existing One Works
**Use what's already in the codebase.**

Before creating:
- A new utility → Check `apps/web/src/lib/utils.ts` and `apps/api/src/utils/`
- A new component → Check `apps/web/src/components/ui/` and `apps/web/src/components/shared/`
- A new hook → Check `apps/web/src/hooks/`
- A new store → Check `apps/web/src/stores/`

### Rule 6: Validation in Shared Schema
**Validation logic lives in one place, used by both API and frontend.**

```typescript
// apps/api/src/schemas/listing.ts
// apps/web/src/schemas/sell-form.ts

export const createListingSchema = z.object({
  make: z.string().min(1, { message: 'validation.makeRequired' }),
  price: z.number().positive(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
});
```

### Rule 7: Every UI Component Handles Three States
**Loading, Empty, and Error states are mandatory.**

```typescript
export function ListingGrid() {
  const { data, isLoading, error } = useListings();

  if (isLoading) return <ListingGridSkeleton />;
  if (error) return <ErrorState message={error.message} retry={refetch} />;
  if (!data?.length) return <EmptyState message={t('listings.noResults')} />;

  return <Grid>{data.map(listing => <Card key={listing.id} {...listing} />)}</Grid>;
}
```

---

## 3. BEFORE YOU CODE CHECKLIST

Before writing any code, mentally confirm:

- [ ] **Have I read the relevant section of ARCHITECTURE.md?**
  - Know which layer you're touching (DB, API, or UI)
  - Understand the data flow

- [ ] **Have I checked that the API endpoint I need already exists?**
  - Check `apps/api/src/routes/` - don't duplicate
  - Check `docs/API.md` for endpoint documentation

- [ ] **Have I confirmed the translation keys exist in all three locale files?**
  - Check `apps/web/messages/et/*.json`
  - Check `apps/web/messages/en/*.json`
  - Check `apps/web/messages/ru/*.json`
  - Add missing keys BEFORE using them

- [ ] **Am I reusing an existing component/utility or creating a necessary new one?**
  - Check `apps/web/src/components/shared/` for reusable UI
  - Check `apps/web/src/lib/utils.ts` for utilities
  - Check `apps/api/src/utils/` for backend utilities

- [ ] **Will my change break any other layer of the stack?**
  - Schema changes → Need migration
  - API changes → Check frontend consumers
  - Frontend component changes → Check all usages

---

## 4. SESSION START PROTOCOL

**At the start of every session, you MUST:**

1. **Read `docs/GROUND_RULES.md`** (this file) — You're doing it now ✅

2. **Read `docs/ARCHITECTURE.md`** — Understand the system layout

3. **Read the relevant section of `docs/API.md`** — Know available endpoints

4. **Read `.agent/rules/` files relevant to your task:**
   - Frontend work → `frontend-rules.md`, `coding-standards.md`
   - Backend work → `backend-rules.md`, `security-rules.md`
   - Database work → `architecture-guidelines.md`

5. **Only then read the specific files you intend to modify**

6. **State your plan before writing any code**
   - What files will you change?
   - What is the expected outcome?
   - How will you verify it works?

---

## 5. QUICK REFERENCE

### Running the Project
```bash
# Start everything
npm run dev

# Start individual apps
npm run dev:web
npm run dev:api

# Database
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio (port 5555)
```

### Testing
```bash
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

### Code Quality
```bash
npm run lint         # ESLint
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # TypeScript check
npm run format       # Prettier format
```

### Environment Files
```bash
apps/api/.env              # Backend config
apps/web/.env.local        # Frontend config
```

---

**Last Updated:** 2026-02-19  
**Version:** 1.0.0  
**Status:** Living document — update when rules change
