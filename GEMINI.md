# GEMINI.md - Kaarplus Project Configuration

## Project Overview

**Kaarplus** is a production-ready car sales marketplace for the Estonian market. This is a full-stack monorepo with Next.js frontend and Express backend, supporting B2C and C2C vehicle sales with integrated Stripe payments.

### Key Facts
- **Target Market:** Estonia
- **Languages:** Estonian (primary), Russian, English
- **Currency:** EUR only
- **Platform:** Web-first (mobile app planned)
- **Design:** Light mode priority, Figma-based

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| UI Components | Shadcn/ui |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL 15+, Prisma ORM |
| Auth | NextAuth.js v5 (Auth.js) with JWT |
| Payments | Stripe (EUR, Card, Apple Pay, Google Pay) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Storage | AWS S3 (eu-central-1) |
| Email | SendGrid |
| Testing | Vitest (unit), Playwright (E2E) |

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Next.js    │──────▶│   Express   │──────▶│  PostgreSQL │
│  (Port 3000)│◀──────│  (Port 4000)│◀──────│   + Prisma  │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐      ┌─────────────┐
│  NextAuth   │      │   Stripe    │
│   (JWT)     │      │  Webhooks   │
└─────────────┘      └─────────────┘
```

## Global Preferences

### Code Style
- **Strict TypeScript** - No `any` without explicit justification
- **Named exports only** - No default exports
- **Async/await** - No raw promises
- **Functional components** - No class components
- **Server Components by default** - Add `"use client"` only when needed

### Naming Conventions
| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `VehicleCard.tsx` |
| Utilities | camelCase | `formatPrice.ts` |
| Constants | UPPER_SNAKE | `MAX_LISTINGS` |
| Types | PascalCase | `interface ListingProps` |
| Files (pages) | kebab-case | `forgot-password/page.tsx` |

### File Organization
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   ├── (public)/
│   ├── (protected)/
│   └── api/               # API routes
├── components/
│   ├── ui/                # Shadcn/ui (don't modify)
│   ├── layout/            # Header, Footer
│   ├── shared/            # Reusable components
│   └── [feature]/         # Feature-specific
├── lib/
│   ├── api/               # API clients
│   ├── utils.ts           # Utilities
│   └── stores/            # Zustand stores
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── schemas/               # Zod schemas
```

## Language-Specific Best Practices

### TypeScript
```typescript
// ✅ Use interface for object shapes
interface ListingProps {
  id: string;
  make: string;
  model: string;
}

// ✅ Use type for unions
type ListingStatus = 'ACTIVE' | 'PENDING' | 'SOLD';

// ✅ Use satisfies for type-safe literals
const config = {
  apiUrl: 'http://localhost:4000',
} satisfies Config;

// ✅ Descriptive variable names
const activeListings = listings.filter(l => l.status === 'ACTIVE');

// ❌ No 'any'
function process(data: any) { } // BAD

// ✅ Use unknown and narrow
function process(data: unknown) {
  if (typeof data === 'string') { }
}
```

### React
```typescript
// ✅ Server Component (default)
export default async function ListingPage() {
  const listings = await getListings();
  return <ListingGrid listings={listings} />;
}

// ✅ Client Component (when needed)
"use client";
export function FavoriteButton() {
  const [isFavorite, setIsFavorite] = useState(false);
  return <button onClick={() => setIsFavorite(!isFavorite)}>♥</button>;
}

// ✅ Named exports
export function VehicleCard() { }

// ❌ No default exports
export default function VehicleCard() { } // BAD
```

### Express
```typescript
// ✅ Service layer for business logic
class ListingService {
  async create(data: CreateListingInput) {
    // Business logic here
  }
}

// ✅ Controller handles HTTP
export const createListing = async (req: Request, res: Response) => {
  const listing = await listingService.create(req.body);
  res.status(201).json({ data: listing });
};

// ✅ Zod validation
const result = schema.safeParse(req.body);
if (!result.success) {
  throw new BadRequestError(result.error.issues[0].message);
}
```

### Styling (Tailwind)
```typescript
// ✅ Use CSS variables
<div className="text-primary bg-background border-border">

// ✅ Use cn() for conditionals
<div className={cn('p-4', isActive && 'bg-primary', className)}>

// ❌ No hardcoded colors
<div className="text-[#333] bg-white"> // BAD

// ✅ Desktop-first responsive
<div className="grid grid-cols-4 gap-6">           // Desktop
  <div className="col-span-4 lg:col-span-3">       // Responsive
```

## Documentation Standards

### JSDoc for Public APIs
```typescript
/**
 * Formats a price in EUR with Estonian locale
 * @param price - The price in euros
 * @param includeVat - Whether to include VAT indicator
 * @returns Formatted price string (e.g., "15 000 € (km-ga)")
 * @example
 * formatPrice(15000) // "15 000 € (km-ga)"
 * formatPrice(15000, false) // "15 000 € (km-ta)"
 */
export function formatPrice(price: number, includeVat = true): string {
  // Implementation
}
```

### Component Documentation
```typescript
interface VehicleCardProps {
  /** The listing to display */
  listing: Listing;
  /** Optional additional CSS classes */
  className?: string;
  /** Callback when favorite button is clicked */
  onFavorite?: (id: string) => void;
}

/**
 * Displays a vehicle listing card with image, details, and actions.
 * 
 * @example
 * <VehicleCard 
 *   listing={listing} 
 *   onFavorite={(id) => console.log('Favorited', id)}
 * />
 */
export function VehicleCard({ listing, className, onFavorite }: VehicleCardProps) {
  // Implementation
}
```

## Communication Style Preferences

### Code Reviews
- Be constructive and specific
- Explain the "why" behind suggestions
- Provide code examples
- Distinguish between blockers and suggestions

### Commit Messages
```
type(scope): description

feat(listings): add price filter slider
fix(auth): resolve JWT expiration issue
docs(api): update endpoint documentation
refactor(services): extract validation logic
test(e2e): add checkout flow tests
```

### PR Descriptions
```markdown
## Summary
Brief description of changes

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests added
- [ ] E2E tests added
- [ ] Manual testing completed

## Screenshots (if UI)
[Before/After images]

## Related Issues
Fixes #123
```

## Security Reminders

### Critical Rules
1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Use Zod schemas
3. **Check authorization** - Verify resource ownership
4. **Use parameterized queries** - Prisma ORM
5. **XSS prevention** - React escapes by default
6. **CSRF protection** - SameSite cookies

### Security Checklist for Every Change
- [ ] No secrets in code
- [ ] Input validation
- [ ] Authorization checks
- [ ] Error handling (no info leakage)
- [ ] Rate limiting (if applicable)

## Performance Guidelines

### Frontend
- Use Server Components for static content
- Lazy load below-fold content
- Optimize images with next/image
- Use proper memoization

### Backend
- Use database indexes
- Avoid N+1 queries
- Implement pagination
- Use connection pooling

### Database
- Index frequently queried columns
- Use select/include wisely
- Consider query optimization
- Monitor slow queries

## Accessibility (a11y)

### Required Practices
- Semantic HTML (`<nav>`, `<main>`, `<article>`)
- Alt text for images
- ARIA labels for icons/buttons
- Keyboard navigation support
- Focus management
- Color contrast compliance

```typescript
// ✅ Accessible button
<button 
  aria-label="Add to favorites"
  onClick={handleFavorite}
>
  <HeartIcon aria-hidden />
</button>

// ✅ Accessible form
<label htmlFor="email">Email</label>
<input 
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

## Internationalization (i18n)

### Primary Language: Estonian
```json
{
  "common": {
    "save": "Salvesta",
    "cancel": "Tühista",
    "delete": "Kustuta"
  },
  "listings": {
    "title": "Kasutatud autod",
    "noResults": "Kuulutusi ei leitud"
  }
}
```

### Usage
```typescript
// Server Component
const t = await getTranslations('listings');
<h1>{t('title')}</h1>;

// Client Component
const t = useTranslations('listings');
<h1>{t('title')}</h1>;
```

## Common Commands

```bash
# Development
npm run dev              # Start all apps
npm run dev:web          # Frontend only
npm run dev:api          # Backend only

# Database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed data

# Quality
npm run lint             # ESLint
npm run lint:fix         # Fix lint issues
npm run typecheck        # TypeScript check
npm run format           # Prettier format

# Testing
npm run test             # Unit tests
npm run test:watch       # Watch mode
npm run test:e2e         # E2E tests
npm run test:coverage    # Coverage report

# Build
npm run build            # Build all apps
```

## Emergency Contacts & Resources

### Documentation
- `CLAUDE.md` - Project overview and conventions
- `docs/ARCHITECTURE.md` - System architecture
- `docs/API.md` - API reference
- `docs/DATABASE.md` - Schema documentation
- `docs/DESIGN_SYSTEM.md` - UI/UX guidelines

### External Resources
- Figma: https://www.figma.com/design/l71M638BL3FCtWZCOvEh1F/Kaarplus
- Staging: https://staging.kaarplus.ee
- Production: https://kaarplus.ee

## Agent Instructions

When working on this codebase:

1. **Always read relevant docs first** - Check `docs/` and `CLAUDE.md`
2. **Follow conventions** - Use established patterns
3. **Check Stitch reference** - For UI implementation
4. **Run quality checks** - Lint, typecheck, tests
5. **Consider security** - Validate inputs, check auth
6. **Think about i18n** - Extract strings for Estonian
7. **Test thoroughly** - Unit, integration, E2E
8. **Update documentation** - Keep docs in sync

### Decision Making
- Prefer **simplicity** over cleverness
- Choose **clarity** over brevity
- Favor **composition** over inheritance
- Use **existing patterns** over new ones
- **Ask** when uncertain

### Quality Gates
Before considering work complete:
- [ ] Code follows conventions
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Security reviewed
- [ ] Accessibility checked
- [ ] i18n strings extracted
