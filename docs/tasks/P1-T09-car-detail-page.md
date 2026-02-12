# P1-T09: Car Detail Page

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T04, P1-T07
> **Estimated Time:** 4 hours

## Objective

Build the car detail/profile page with image gallery, specifications, seller information, contact buttons, and related cars section.

## Scope

### URL Structure

`/cars/[id]/[slug]` — where slug is generated from `make-model-year` (e.g., `bmw-3-series-2022`)

### Page Sections

1. **Breadcrumb Navigation** — Home > Cars > Make > Model

2. **Title Bar** — Make Model + Variant, year

3. **Image Gallery**
   - Main large image
   - Thumbnail strip (8+ images)
   - Image counter (1/23)
   - Full-screen lightbox on click
   - Navigation arrows

4. **Sidebar Card** (sticky on desktop)
   - Price (with/without VAT toggle)
   - Deal badge (e.g., "Good Deal", "Fair Price")
   - "Contact Dealer" button (opens modal)
   - "Schedule Test Drive" button
   - Share button (copy link, social)
   - Favorite button
   - Seller Information:
     - Company name / individual name
     - Sales consultant (photo, name)
     - Phone number (click to call)
     - Email
     - Physical address (link to map)
     - Dealer badges (if applicable)

5. **Specifications Section**
   - Basic info grid: Published date, Mileage, Year, Fuel Type, Transmission, Power
   - Full description (expandable if long)
   - Feature badges (extensive list from JSONB features)
   - Price history button (opens modal/graph — stub for MVP)

6. **Related Cars Section**
   - 4 similar cars (same make or body type)
   - Horizontal scroll on mobile

### SEO

- Dynamic `generateMetadata()`:
  - Title: `{Year} {Make} {Model} - €{Price} | Kaarplus`
  - Description: summary of key specs
  - OG image: first listing image
- JSON-LD: Vehicle schema
- Canonical URL: `/cars/{id}/{slug}`

### Data Fetching

- Server component with `fetch` to API
- Increment view count on load
- Handle 404 for invalid listing IDs

## Acceptance Criteria

- [ ] Gallery displays all images with lightbox
- [ ] Sidebar sticky scrolling works on desktop
- [ ] Contact modal opens and sends inquiry
- [ ] Share button copies URL or opens share sheet
- [ ] All specs rendered from listing data
- [ ] Feature badges display correctly
- [ ] Related cars section shows relevant results
- [ ] SEO meta tags are dynamically generated
- [ ] 404 page for invalid listings
- [ ] Mobile layout reflows correctly

## Components to Create

```
components/car-detail/
├── image-gallery.tsx
├── image-lightbox.tsx
├── price-card.tsx
├── seller-info.tsx
├── contact-modal.tsx
├── specs-grid.tsx
├── feature-badges.tsx
├── related-cars.tsx
└── breadcrumbs.tsx
```
