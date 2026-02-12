# P1-T13: SEO Implementation

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T06, P1-T08, P1-T09
> **Estimated Time:** 3 hours

## Objective

Implement comprehensive SEO across all public pages: dynamic meta tags, JSON-LD structured data, XML sitemap, robots.txt, and performance optimizations.

## Scope

### Dynamic Metadata

Every page exports `generateMetadata()` or static `metadata`:

- Landing: "Kaarplus | Autode ost ja müük Eestis"
- Listings: "Autode müük - {filterDescription} | Kaarplus"
- Detail: "{Year} {Make} {Model} - €{Price} | Kaarplus"
- Sell: "Müü oma auto | Kaarplus"

### JSON-LD Structured Data

- **Organization** — on all pages (in root layout)
- **WebSite** — with SearchAction (on landing)
- **Vehicle** — on car detail pages
- **BreadcrumbList** — on listings and detail pages
- **AggregateRating** — on landing testimonials
- **FAQ** — on FAQ page

### XML Sitemap

- Dynamic sitemap at `/sitemap.xml`
- Includes: all active listing URLs, static pages
- Priority: landing (1.0), listings (0.8), detail pages (0.7), legal (0.3)
- Frequency: listings (daily), static pages (weekly)

### Robots.txt

```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Sitemap: https://kaarplus.ee/sitemap.xml
```

### Performance Optimizations

- Image optimization with `next/image` (WebP, responsive sizes, lazy loading)
- Code splitting (auto with App Router)
- Font optimization (display: swap)
- Proper heading hierarchy audit

### Estonian Language SEO

- `<html lang="et">`
- Estonian keywords in meta tags
- Hreflang tags (when i18n is added later)

## Acceptance Criteria

- [ ] All public pages have unique, descriptive title and meta description
- [ ] JSON-LD validates on Google Rich Results Test
- [ ] Sitemap is accessible and lists all active listings
- [ ] Robots.txt is correct
- [ ] Open Graph tags work (test with Facebook sharing debugger)
- [ ] Twitter Card tags work
- [ ] All images use `next/image` with alt text
- [ ] Page has single H1

## Files to Create/Modify

```
apps/web/app/sitemap.ts
apps/web/app/robots.ts
apps/web/lib/seo.ts (JSON-LD helpers)
apps/web/components/shared/json-ld.tsx
```
