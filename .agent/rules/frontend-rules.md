---
title: Frontend Rules
description: Specific rules for Next.js App Router, React components, styling with Tailwind/Shadcn, i18n, and SEO implementation in the Kaarplus web app.
triggers:
  - "apps/web/**/*.tsx"
  - "apps/web/**/*.ts"
  - "*.css"
  - "tailwind.config.*"
---

# Frontend Rules

## Next.js App Router Rules

### Route Groups
```
app/
├── (auth)/           # Auth routes (no layout)
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (public)/         # Public routes (main layout)
│   ├── page.tsx      # Landing page
│   ├── listings/
│   └── cars/
├── (protected)/      # Protected routes (auth required)
│   └── sell/
├── admin/            # Admin routes
├── dashboard/        # User dashboard
└── api/              # API routes (auth handlers)
```

### Server vs Client Components

**Server Components (Default):**
- Data fetching
- SEO-critical content
- Static content
- Database queries (via API)

**Client Components (`"use client"`):**
- Interactive elements
- Browser APIs
- React hooks (useState, useEffect)
- Event handlers

```typescript
// ✅ Server Component - data fetching
export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  return <ListingDetail listing={listing} />;
}

// ✅ Client Component - interactivity
"use client";
export function FavoriteButton({ listingId }: { listingId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  return <button onClick={() => toggleFavorite()}>♥</button>;
}
```

### Metadata & SEO

**Every public page MUST export metadata:**
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kasutatud autod Eestis | Kaarplus',
  description: 'Leidke parimad kasutatud autod Eestis. Üle 1000 kuulutuse...',
  openGraph: {
    title: '...',
    description: '...',
    images: ['/og-image.jpg'],
  },
};

// Dynamic metadata for detail pages
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.id);
  return {
    title: `${listing.make} ${listing.model} | Kaarplus`,
    // ...
  };
}
```

### JSON-LD Structured Data
```typescript
// components/shared/json-ld.tsx
export function VehicleJsonLd({ listing }: { listing: Listing }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${listing.make} ${listing.model}`,
    brand: { '@type': 'Brand', name: listing.make },
    model: listing.model,
    // ...
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

## Component Architecture

### Component File Structure
```typescript
// components/shared/vehicle-card.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
interface VehicleCardProps {
  listing: Listing;
  className?: string;
  onFavorite?: (id: string) => void;
}

// Component
export function VehicleCard({ listing, className, onFavorite }: VehicleCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Content */}
    </Card>
  );
}

// Named export only
export { VehicleCard };
```

### Shadcn/ui Usage
- Use Shadcn components as base
- Customize via Tailwind classes
- Never modify component internals
- Extend via composition

```typescript
// ✅ Extend via composition
export function VehicleCard({ children, className }: VehicleCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

### Custom Hooks
```typescript
// hooks/use-favorites.ts
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleFavorite = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await api.post(`/api/listings/${id}/favorite`);
      setFavorites(prev => 
        prev.includes(id) 
          ? prev.filter(f => f !== id)
          : [...prev, id]
      );
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { favorites, toggleFavorite, isLoading };
}
```

## Styling Rules

### Tailwind CSS Standards
```typescript
// ✅ Use utility classes
<div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">

// ✅ Use cn() for conditionals
<div className={cn('p-4', isActive && 'bg-primary', className)}>

// ✅ Use CSS variables
<div className="text-primary bg-background border-border">

// ❌ No arbitrary values (unless necessary)
<div className="w-[123px]">  // Avoid
<div className="w-32">       // Use standard scale
```

### Responsive Design
- Desktop-first (matches Figma)
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

```typescript
// Desktop-first approach
<div className="grid grid-cols-4 gap-6">           // Desktop: 4 columns
  <div className="col-span-4 lg:col-span-3">       // Desktop: 3/4, Mobile: full
    {/* Main content */}
  </div>
  <div className="hidden lg:block col-span-1">     // Desktop only sidebar
    {/* Sidebar */}
  </div>
</div>
```

### Design Tokens (CSS Variables)
```css
/* Always use these tokens */
bg-background        /* Page background */
bg-card              /* Card background */
bg-primary           /* Primary button/accent */
text-primary         /* Primary text */
text-secondary       /* Secondary text */
text-muted-foreground /* Muted/helper text */
border-border        /* Borders */
ring-ring            /* Focus rings */
```

## Internationalization (i18n)

### Translation Files Structure
```
messages/
├── et/               # Estonian (primary)
│   ├── common.json
│   ├── home.json
│   ├── listings.json
│   └── auth.json
├── en/               # English
└── ru/               # Russian
```

### Using Translations
```typescript
// Client Component
"use client";
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('home');
  return <h1>{t('hero.title')}</h1>;
}

// Server Component
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('listings');
  return <h1>{t('title')}</h1>;
}
```

### Translation Keys Convention
```json
{
  "page": {
    "title": "Page Title",
    "description": "Page description"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email"
  }
}
```

## State Management

### Zustand Store Pattern
```typescript
// stores/use-filter-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  filters: ListingFilters;
  setFilters: (filters: Partial<ListingFilters>) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      filters: {},
      setFilters: (newFilters) => 
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      resetFilters: () => set({ filters: {} }),
    }),
    { name: 'filter-storage' }
  )
);
```

### URL State for Shareable Filters
```typescript
// Sync filters with URL
const router = useRouter();
const searchParams = useSearchParams();

const updateFilters = (newFilters: FilterState) => {
  const params = new URLSearchParams(searchParams);
  Object.entries(newFilters).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
    else params.delete(key);
  });
  router.push(`?${params.toString()}`);
};
```

## Form Handling

### React Hook Form + Zod
```typescript
"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data: FormData) => {
    // Submit logic
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## Image Handling

### Next.js Image Component
```typescript
import Image from 'next/image';

// ✅ Use next/image for optimization
<Image
  src={listing.images[0].url}
  alt={`${listing.make} ${listing.model}`}
  width={800}
  height={600}
  className="object-cover rounded-lg"
  priority={isFirst} // Above-fold images
/>

// ✅ Blur placeholder for loading state
<Image
  src={imageUrl}
  alt={alt}
  fill
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## Error Handling

### Error Boundaries
```typescript
// error.tsx in route directory
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2>Something went wrong!</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### Loading States
```typescript
// loading.tsx in route directory
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

## Performance Rules

### Code Splitting
```typescript
// Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false, // If browser-only
});
```

### Preloading
```typescript
// Preload critical resources
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
```

### List Virtualization (for long lists)
```typescript
// Use react-window or @tanstack/react-virtual for lists > 50 items
import { Virtualizer } from '@tanstack/react-virtual';
```

## Accessibility (a11y)

### Required Practices
```typescript
// ✅ Semantic HTML
<nav>, <main>, <article>, <aside>

// ✅ ARIA labels
<button aria-label="Add to favorites">
  <HeartIcon />
</button>

// ✅ Focus management
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">

// ✅ Keyboard navigation
<button onKeyDown={(e) => e.key === 'Enter' && handleClick()}>

// ✅ Alt text for images
<Image alt={`${make} ${model} - ${year}`} />

// ✅ Form labels
<label htmlFor="email">Email</label>
<input id="email" aria-describedby="email-error" />
<span id="email-error" role="alert">{error}</span>
```

## Testing

### Component Tests
```typescript
// vehicle-card.test.tsx
import { render, screen } from '@testing-library/react';
import { VehicleCard } from './vehicle-card';

describe('VehicleCard', () => {
  it('should display vehicle information', () => {
    render(<VehicleCard listing={mockListing} />);
    expect(screen.getByText(mockListing.make)).toBeInTheDocument();
  });
});
```

### E2E Tests
```typescript
// e2e/listings.spec.ts
import { test, expect } from '@playwright/test';

test('user can view listing details', async ({ page }) => {
  await page.goto('/listings/123');
  await expect(page.getByTestId('listing-title')).toBeVisible();
});
```
