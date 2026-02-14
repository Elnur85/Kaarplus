# P1-T06: Landing Page

> **Phase:** 1 — Core MVP
> **Status:** ✅ Complete
> **Dependencies:** P1-T04
> **Estimated Time:** 4 hours

## Objective

Build the main landing page following the Figma design **NOT styled like Turbo.az or Auto24**. Include hero section, search bar, vehicle category sections (Buy/Electric/Hybrid), value propositions, popular brands, Carvago-style reviews, statistics, FAQ, and newsletter signup.

**Excluded for MVP:** Video, "Old for New", "Comprehensive services" features

## Scope

### Sections (in order)

1. **Hero Section** — modern design with overlay text, rating stars, review count (**no video for MVP**)
2. **Search Bar** — Make, Model, Year, Fuel Type, Price Range, Transmission dropdowns + Search button
3. **Vehicle Category Sections:**
   - **Buy** — general car listings grid
   - **Electric** — electric vehicles with **dealership ad placements**
   - **Hybrid** — hybrid vehicles with **dealership ad placements**
4. **Category Quick Links** — 8 vehicle body types (Micro, Sedan, Hatchback, Family, Sport, SUV, Truck, Van) with icons
5. **Value Propositions** — 4 feature blocks with icons (e.g., "Verified Vehicles", "Secure Payments", "Easy Search", "Trusted Dealers")
6. **Popular Brands** — 8+ brand logos (BMW, Audi, Toyota, etc.) with listing counts
7. **Customer Reviews** — **Carvago-style** carousel with customer photos, names, ratings, review text
8. **Statistics Section** — animated counters (verified cars, satisfied customers, etc.)
9. **FAQ Accordion** — 6-8 common questions
10. **Newsletter Signup** — email input + subscribe button
11. **Footer** (already in layout from P1-T04)

### SEO for Landing Page

- Title: "Kaarplus | Autode ost ja müük Eestis - Elektri ja hübriidautod"
- Meta description with Estonian keywords (including electric/hybrid)
- JSON-LD: Organization, WebSite (with SearchAction)
- H1: Main heading in hero
- All images with alt text
- Support for multi-language meta (ET/RU/EN)

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
- **Design Style:** NOT like Turbo.az or Auto24
- Use Shadcn/ui components for cards, buttons, accordion
- Brand logos can be SVGs or placeholder images initially
- Hero images: use high-quality car images (placeholder or stock)
- **Reviews:** Carvago-style presentation

## Components to Create

```
components/landing/
├── hero-section.tsx          # Modern design, no video
├── search-bar.tsx
├── vehicle-categories.tsx    # Buy/Electric/Hybrid sections
├── category-grid.tsx
├── value-propositions.tsx
├── popular-brands.tsx
├── reviews-carousel.tsx      # Carvago-style
├── statistics-section.tsx
├── faq-section.tsx
└── newsletter-signup.tsx
```
