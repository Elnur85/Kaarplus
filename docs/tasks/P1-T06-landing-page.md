# P1-T06: Landing Page

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T04
> **Estimated Time:** 4 hours

## Objective

Build the main landing page following the Figma design, with hero section, search bar, category quick links, value propositions, popular brands, testimonials, statistics, FAQ, and newsletter signup.

## Scope

### Sections (in order)

1. **Hero Section** — full-width image carousel with overlay text, rating stars, review count
2. **Search Bar** — Make, Model, Year, Fuel Type, Price Range, Transmission dropdowns + Search button
3. **Category Quick Links** — 8 vehicle body types (Micro, Sedan, Hatchback, Family, Sport, SUV, Truck, Van) with icons
4. **Value Propositions** — 4 feature blocks with icons (e.g., "Verified Vehicles", "Secure Payments", "Easy Search", "Trusted Dealers")
5. **Popular Brands** — 8+ brand logos (BMW, Audi, Toyota, etc.) with listing counts
6. **Customer Testimonials** — carousel with customer photos, names, ratings, review text
7. **Statistics Section** — animated counters (verified cars, satisfied customers, etc.)
8. **FAQ Accordion** — 6-8 common questions
9. **Newsletter Signup** — email input + subscribe button
10. **Footer** (already in layout from P1-T04)

### SEO for Landing Page

- Title: "Kaarplus | Autode ost ja müük Eestis"
- Meta description with Estonian keywords
- JSON-LD: Organization, WebSite (with SearchAction)
- H1: Main heading in hero
- All images with alt text

### Responsive Behavior

- Desktop-first (matches Figma)
- Tablet: 2-column grid for categories, smaller hero
- Mobile: single column, stacked sections

## Acceptance Criteria

- [ ] All 9 sections render correctly
- [ ] Search bar has functional dropdowns (data can be static for now)
- [ ] Category links navigate to `/cars?bodyType=<type>`
- [ ] Testimonials carousel auto-plays and supports manual navigation
- [ ] FAQ accordion expands/collapses
- [ ] Newsletter email input validates and shows success state
- [ ] Page loads under 3 seconds (optimize images)
- [ ] SEO meta tags are correct

## Design Reference

- Figma: Landing page screen
- Use Shadcn/ui components for cards, buttons, accordion
- Brand logos can be SVGs or placeholder images initially
- Hero images: use high-quality car images (placeholder or stock)

## Components to Create

```
components/landing/
├── hero-carousel.tsx
├── search-bar.tsx
├── category-grid.tsx
├── value-propositions.tsx
├── popular-brands.tsx
├── testimonials-carousel.tsx
├── statistics-section.tsx
├── faq-section.tsx
└── newsletter-signup.tsx
```
