---
name: api-client-generator
description: Generates type-safe API clients, service classes, and fetch utilities for the Kaarplus frontend to communicate with the Express backend. Creates consistent error handling, request/response typing, and React hooks for data fetching.
triggers:
  - "Generate API client"
  - "Create API service"
  - "API client for"
  - "Fetch utility"
  - "API hook"
  - "Backend integration"
---

# API Client Generator Skill

## Goal
Generate type-safe API clients and React hooks for frontend-backend communication following project conventions.

## Architecture

```
Frontend Component → API Client/Hook → Express API → Service → Prisma → Database
```

## Step-by-Step Instructions

### Step 1: Identify API Endpoints

Check backend routes to understand available endpoints:
```typescript
// apps/api/src/routes/listings.ts
router.get('/', getAllListings);           // List
router.get('/:id', getListingById);        // Detail
router.post('/', requireAuth, createListing); // Create
router.patch('/:id', requireAuth, updateListing); // Update
router.delete('/:id', requireAuth, deleteListing); // Delete
```

### Step 2: Define Types

Create shared types matching backend schemas:

```typescript
// apps/web/src/types/listing.ts
export interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  description?: string;
  images: ListingImage[];
  user: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListingImage {
  id: string;
  url: string;
  order: number;
}

export interface ListingQuery {
  page?: number;
  pageSize?: number;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
}

export interface CreateListingInput {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  description?: string;
}
```

### Step 3: Create API Client Functions

```typescript
// apps/web/src/lib/api/listings.ts
import { apiClient, ApiResponse } from './client';
import type { Listing, ListingQuery, CreateListingInput } from '@/types/listing';

const BASE_URL = '/api/listings';

export async function getListings(
  query: ListingQuery = {}
): Promise<ApiResponse<{ data: Listing[]; meta: PaginationMeta }>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });
  
  return apiClient.get(`${BASE_URL}?${params.toString()}`);
}

export async function getListing(id: string): Promise<ApiResponse<{ data: Listing }>> {
  return apiClient.get(`${BASE_URL}/${id}`);
}

export async function createListing(
  data: CreateListingInput
): Promise<ApiResponse<{ data: Listing }>> {
  return apiClient.post(BASE_URL, data);
}

export async function updateListing(
  id: string,
  data: Partial<CreateListingInput>
): Promise<ApiResponse<{ data: Listing }>> {
  return apiClient.patch(`${BASE_URL}/${id}`, data);
}

export async function deleteListing(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete(`${BASE_URL}/${id}`);
}
```

### Step 4: Create Base API Client

```typescript
// apps/web/src/lib/api/client.ts
import { auth } from '@/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

async function getAuthToken(): Promise<string | null> {
  const session = await auth();
  return session?.apiToken || null;
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.error || 'An error occurred',
      error.details
    );
  }
  
  return response;
}

export const apiClient = {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetchWithAuth(url);
    return response.json();
  },
  
  async post<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async patch<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });
    if (response.status === 204) return {} as ApiResponse<T>;
    return response.json();
  },
};
```

### Step 5: Create React Hooks

```typescript
// apps/web/src/hooks/use-listings.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getListings, getListing } from '@/lib/api/listings';
import type { Listing, ListingQuery } from '@/types/listing';

interface UseListingsReturn {
  listings: Listing[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useListings(query: ListingQuery = {}): UseListingsReturn {
  const [listings, setListings] = useState<Listing[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getListings(query);
      if (response.error) {
        throw new Error(response.error);
      }
      setListings(response.data?.data || []);
      setMeta(response.data?.meta || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [query]);
  
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);
  
  return { listings, meta, isLoading, error, refetch: fetchListings };
}

// For server components - direct fetch
export async function fetchListings(query: ListingQuery = {}) {
  return getListings(query);
}
```

### Step 6: Create Mutation Hooks

```typescript
// apps/web/src/hooks/use-listing-mutations.ts
"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  createListing,
  updateListing,
  deleteListing,
} from '@/lib/api/listings';
import type { CreateListingInput, Listing } from '@/types/listing';

interface UseCreateListingReturn {
  create: (data: CreateListingInput) => Promise<Listing | null>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreateListing(): UseCreateListingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const create = useCallback(async (data: CreateListingInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createListing(data);
      if (response.error) {
        throw new Error(response.error);
      }
      toast({ title: 'Kuulutus loodud!' });
      router.push(`/listings/${response.data?.data.id}`);
      return response.data?.data || null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      toast({
        title: 'Viga',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);
  
  return { create, isLoading, error };
}

export function useDeleteListing() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const deleteListingById = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await deleteListing(id);
      toast({ title: 'Kuulutus kustutatud' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Viga',
        description: 'Kustutamine ebaõnnestus',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);
  
  return { deleteListing: deleteListingById, isLoading };
}
```

## Examples

### Example 1: Complete API Integration

**User Request:** "Create API integration for the favorites feature"

**Generated Code:**

```typescript
// types/favorite.ts
export interface Favorite {
  id: string;
  listingId: string;
  userId: string;
  createdAt: string;
  listing: {
    id: string;
    make: string;
    model: string;
    price: number;
    images: { url: string }[];
  };
}
```

```typescript
// lib/api/favorites.ts
import { apiClient } from './client';
import type { Favorite } from '@/types/favorite';

const BASE_URL = '/api/favorites';

export async function getFavorites() {
  return apiClient.get<{ data: Favorite[] }>(BASE_URL);
}

export async function addFavorite(listingId: string) {
  return apiClient.post<{ data: Favorite }>(BASE_URL, { listingId });
}

export async function removeFavorite(listingId: string) {
  return apiClient.delete(`${BASE_URL}/${listingId}`);
}

export async function checkIsFavorite(listingId: string) {
  return apiClient.get<{ data: boolean }>(`${BASE_URL}/check/${listingId}`);
}
```

```typescript
// hooks/use-favorites.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getFavorites, addFavorite, removeFavorite } from '@/lib/api/favorites';
import { useToast } from '@/hooks/use-toast';
import type { Favorite } from '@/types/favorite';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    loadFavorites();
  }, []);
  
  const loadFavorites = async () => {
    try {
      const response = await getFavorites();
      setFavorites(response.data?.data || []);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleFavorite = useCallback(async (listingId: string) => {
    const isFavorite = favorites.some(f => f.listingId === listingId);
    
    try {
      if (isFavorite) {
        await removeFavorite(listingId);
        setFavorites(prev => prev.filter(f => f.listingId !== listingId));
        toast({ title: 'Eemaldatud lemmikutest' });
      } else {
        const response = await addFavorite(listingId);
        if (response.data?.data) {
          setFavorites(prev => [...prev, response.data!.data]);
          toast({ title: 'Lisatud lemmikutesse' });
        }
      }
    } catch (error) {
      toast({
        title: 'Viga',
        description: 'Tegevus ebaõnnestus',
        variant: 'destructive',
      });
    }
  }, [favorites, toast]);
  
  return { favorites, isLoading, toggleFavorite };
}
```

## Constraints

### DO
- [ ] Use TypeScript for all API functions
- [ ] Handle errors consistently
- [ ] Use React hooks for client-side data fetching
- [ ] Support server-side fetching for SSR
- [ ] Include loading and error states
- [ ] Use proper HTTP methods
- [ ] Include credentials for auth

### DON'T
- [ ] Don't use `any` types
- [ ] Don't ignore errors
- [ ] Don't fetch in render without caching
- [ ] Don't hardcode API URLs
- [ ] Don't forget auth headers
