---
name: component-generator
description: Generates React components for the Kaarplus Next.js frontend following project conventions. Creates Server Components by default, uses Shadcn/ui primitives, Tailwind CSS for styling, and ensures named exports. Supports both UI components and page components with proper TypeScript typing.
triggers:
  - "Generate component"
  - "Create component"
  - "New component"
  - "Component for"
  - "Build UI component"
  - "React component"
---

# Component Generator Skill

## Goal
Generate React components following Kaarplus project conventions with proper TypeScript, Shadcn/ui integration, and Tailwind styling.

## Prerequisites
- Read `docs/DESIGN_SYSTEM.md` for design tokens
- Check corresponding Stitch folder if implementing from design
- Verify if component already exists in `src/components/`

## Step-by-Step Instructions

### Step 1: Determine Component Type

**Server Component (Default):**
- Static content
- Data fetching
- SEO-critical content
- No interactivity needed

**Client Component (`"use client"`):**
- User interactions (buttons, forms)
- Browser APIs
- React hooks
- Event handlers

### Step 2: Choose Location

```
src/components/
├── ui/              # Shadcn/ui components (don't modify)
├── layout/          # Header, Footer, navigation
├── shared/          # Reusable business components
├── listings/        # Listing-specific components
├── auth/            # Auth-related components
├── dashboard/       # Dashboard components
└── [feature]/       # Feature-specific components
```

### Step 3: Generate Component Structure

#### Server Component Template
```typescript
// components/shared/vehicle-card.tsx
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

import type { Listing } from '@/types/listing';

interface VehicleCardProps {
  listing: Listing;
  className?: string;
}

export function VehicleCard({ listing, className }: VehicleCardProps) {
  return (
    <Card className={className}>
      <Link href={`/listings/${listing.id}`}>
        <div className="relative aspect-[4/3]">
          <Image
            src={listing.images[0]?.url || '/placeholder.jpg'}
            alt={`${listing.make} ${listing.model}`}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              {listing.make} {listing.model}
            </h3>
            <Badge variant="secondary">{listing.year}</Badge>
          </div>
          <p className="text-primary font-bold mt-2">
            {formatPrice(listing.price)}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
```

#### Client Component Template
```typescript
// components/shared/favorite-button.tsx
"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  listingId: string;
  initialIsFavorite?: boolean;
  className?: string;
}

export function FavoriteButton({
  listingId,
  initialIsFavorite = false,
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleFavorite = async () => {
    setIsLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/api/listings/${listingId}/favorite`);
        toast({ title: 'Removed from favorites' });
      } else {
        await api.post(`/api/listings/${listingId}/favorite`);
        toast({ title: 'Added to favorites' });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-colors',
          isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        )}
      />
    </Button>
  );
}
```

### Step 4: Add Shadcn/ui Components

```bash
# Check if primitive exists
ls src/components/ui/

# If missing, install it
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Step 5: Add Types (if needed)

```typescript
// types/feature.ts
export interface FeatureProps {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}
```

### Step 6: Add i18n Strings (if user-facing)

```json
// messages/et/components.json
{
  "vehicleCard": {
    "viewDetails": "Vaata detailid",
    "contactSeller": "Võta ühendust"
  }
}
```

### Step 7: Create Test File

```typescript
// components/shared/vehicle-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VehicleCard } from './vehicle-card';

const mockListing = {
  id: '1',
  make: 'Toyota',
  model: 'Corolla',
  year: 2020,
  price: 15000,
  images: [{ url: '/test.jpg' }],
};

describe('VehicleCard', () => {
  it('renders vehicle information', () => {
    render(<VehicleCard listing={mockListing} />);
    
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.getByText('Corolla')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
  });
  
  it('links to listing detail', () => {
    render(<VehicleCard listing={mockListing} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/listings/1');
  });
});
```

## Examples

### Example 1: Filter Sidebar Component

**User Request:** "Generate a filter sidebar component for the listings page"

**Generated Code:**
```typescript
// components/listings/filter-sidebar.tsx
"use client";

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  className?: string;
  makes: string[];
  bodyTypes: string[];
}

export function FilterSidebar({ className, makes, bodyTypes }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <aside className={cn('w-64 space-y-6', className)}>
      <div>
        <h3 className="font-semibold mb-4">Mark</h3>
        <div className="space-y-2">
          {makes.map((make) => (
            <div key={make} className="flex items-center space-x-2">
              <Checkbox
                id={`make-${make}`}
                checked={searchParams.get('make') === make}
                onCheckedChange={(checked) => 
                  updateFilter('make', checked ? make : '')
                }
              />
              <Label htmlFor={`make-${make}`}>{make}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-semibold mb-4">Keretüüp</h3>
        <div className="space-y-2">
          {bodyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`body-${type}`}
                checked={searchParams.get('bodyType') === type}
                onCheckedChange={(checked) => 
                  updateFilter('bodyType', checked ? type : '')
                }
              />
              <Label htmlFor={`body-${type}`}>{type}</Label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
```

### Example 2: Form Component

**User Request:** "Create a contact seller form component"

**Generated Code:**
```typescript
// components/listings/contact-seller-form.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Nimi on kohustuslik'),
  email: z.string().email('Kehtiv email on kohustuslik'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Sõnum peab olema vähemalt 10 tähemärki'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactSellerFormProps {
  listingId: string;
  onSuccess?: () => void;
}

export function ContactSellerForm({ listingId, onSuccess }: ContactSellerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await api.post(`/api/listings/${listingId}/contact`, data);
      toast({ title: 'Sõnum saadetud!' });
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Viga',
        description: 'Sõnumi saatmine ebaõnnestus. Proovi uuesti.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nimi</FormLabel>
              <FormControl>
                <Input placeholder="Sinu nimi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="sinu@email.ee" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon (valikuline)</FormLabel>
              <FormControl>
                <Input placeholder="+372 5555 5555" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sõnum</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Kirjuta oma sõnum siia..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saadan...' : 'Saada sõnum'}
        </Button>
      </form>
    </Form>
  );
}
```

## Constraints

### DO
- [ ] Use Server Components by default
- [ ] Use Shadcn/ui primitives
- [ ] Use Tailwind CSS for styling
- [ ] Use CSS variable tokens (text-primary, bg-background)
- [ ] Use named exports only
- [ ] Add proper TypeScript types
- [ ] Use Lucide React icons
- [ ] Follow accessibility best practices

### DON'T
- [ ] Don't use default exports
- [ ] Don't hardcode colors
- [ ] Don't import from stitch/ folder
- [ ] Don't use Material Icons
- [ ] Don't create custom UI primitives
- [ ] Don't mix server/client logic unnecessarily
