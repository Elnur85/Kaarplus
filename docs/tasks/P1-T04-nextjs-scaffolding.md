# P1-T04: Next.js App Scaffolding & Design System

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T01
> **Estimated Time:** 3 hours

## Objective

Scaffold the Next.js 14+ application with App Router, Tailwind CSS, Shadcn/ui design system, and shared layout components (header, footer, navigation).

## Scope

### 1. Next.js Setup

In `apps/web`:

- Initialize Next.js 14+ with App Router and TypeScript
- Configure Tailwind CSS
- Install and initialize Shadcn/ui
- Set up path aliases (`@/` → `apps/web/`)

### 2. Tailwind & Theme Configuration

- Configure `tailwind.config.ts` with Kaarplus brand colors
- Set up CSS variables for Shadcn/ui theming
- Define the color palette based on Figma design
- Desktop-first breakpoints

### 3. Shadcn/ui Components

Install initial set of components:

- Button, Input, Select, Checkbox, Radio
- Card, Badge, Separator
- Dialog, Sheet, Dropdown Menu
- Tabs, Accordion
- Toast/Sonner for notifications
- Form components (for React Hook Form integration)

### 4. Layout Components

Create shared layout components in `components/layout/`:

- `header.tsx` — main navigation (logo, search, auth buttons, category nav)
- `footer.tsx` — multi-column footer (links, social, newsletter)
- `main-layout.tsx` — wraps header/footer around page content
- `mobile-nav.tsx` — mobile hamburger menu

### 5. App Router Structure

Create the route group directories:

```
app/
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx          # Landing (placeholder)
│   ├── cars/
│   ├── search/
│   ├── compare/
│   └── sell/
├── (auth)/
│   ├── layout.tsx
│   ├── login/
│   └── register/
├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── (legal)/
│   ├── privacy/
│   ├── terms/
│   └── faq/
├── layout.tsx            # Root layout (fonts, metadata, providers)
└── globals.css
```

### 6. Utility Setup

- `lib/utils.ts` — `cn()` helper (Shadcn/ui standard)
- `lib/api.ts` — API client for backend communication
- `lib/constants.ts` — app-wide constants (API URL, etc.)

### 7. Zustand Stores (Stubs)

Create stub stores in `lib/stores/`:

- `useFilterStore.ts`
- `useFavoritesStore.ts`
- `useCompareStore.ts`

### 8. Font & SEO Defaults

- Configure Google Fonts (Inter or similar)
- Root metadata with default SEO values
- `manifest.json` for PWA basics
- Favicon

## Acceptance Criteria

- [ ] `npm run dev:web` starts the app on port 3000
- [ ] Tailwind CSS is working with custom theme
- [ ] Shadcn/ui components render correctly
- [ ] Header and footer are visible on all public pages
- [ ] Route groups are properly structured
- [ ] `cn()` utility works
- [ ] API client can make requests to backend

## Files to Create/Modify

```
apps/web/package.json
apps/web/tsconfig.json
apps/web/tailwind.config.ts
apps/web/postcss.config.js
apps/web/next.config.ts
apps/web/app/layout.tsx
apps/web/app/globals.css
apps/web/app/(public)/layout.tsx
apps/web/app/(public)/page.tsx
apps/web/components/layout/header.tsx
apps/web/components/layout/footer.tsx
apps/web/components/layout/main-layout.tsx
apps/web/components/ui/ (Shadcn/ui generated)
apps/web/lib/utils.ts
apps/web/lib/api.ts
apps/web/lib/constants.ts
apps/web/lib/stores/useFilterStore.ts
apps/web/lib/stores/useFavoritesStore.ts
apps/web/lib/stores/useCompareStore.ts
apps/web/public/favicon.ico
```

## Design Notes

Reference the Figma file for:

- Header layout (logo placement, navigation items, CTA buttons)
- Footer structure (column layout, link groups, social icons)
- Color palette and typography
- Spacing system
