# P4-T02: Core Web Vitals Optimization

> **Phase:** 4 — Polish & Scale
> **Status:** ⬜ Not Started
> **Dependencies:** Phase 1
> **Estimated Time:** 3 hours

## Objective

Optimize the Kaarplus application to pass Google's Core Web Vitals assessment. Focus on Large Contentful Paint (LCP), Interaction to Next Paint (INP) / First Input Delay (FID), and Cumulative Layout Shift (CLS).

## Requirements

### 1. Performance Metrics Targets
- **LCP (Large Contentful Paint):** < 2.5 seconds
- **INP (Interaction to Next Paint):** < 200 milliseconds
- **CLS (Cumulative Layout Shift):** < 0.1

### 2. Key Optimizations

#### Font Optimization
- [ ] Verify `next/font` is effectively used for Google Fonts (Inter).
- [ ] Ensure `display: swap` or appropriate loading strategy to avoid FOIT/FOUT where acceptable.

#### Image Optimization
- [ ] Audit all `<Image />` components.
- [ ] Ensure `sizes` prop is correctly defined for responsive images to avoid downloading oversized images.
- [ ] Verify LCP candidates (e.g., Hero image) use `priority={true}`.
- [ ] Ensure non-LCP images are lazy-loaded (default).
- [ ] Verify explicit width/height or aspect ratio to prevent CLS.

#### Layout Stability (CLS)
- [ ] Ensure all dynamic content containers (ads, banners, carousels) have reserved space before loading.
- [ ] Check for layout shifts during hydration or data fetching.

#### Script & Bundle Optimization
- [ ] Analyze bundle size using `@next/bundle-analyzer` (optional but recommended).
- [ ] Defer non-critical third-party scripts (e.g., analytics, chat widgets) using `next/script` with `strategy="lazyOnload"` or `strategy="worker"`.

#### React & Rendering Performance
- [ ] Verify components are not re-rendering unnecessarily.
- [ ] Use `React.memo`, `useMemo`, and `useCallback` where appropriate for expensive computations or stable references.
- [ ] Ensure server components are used where possible to reduce client-side JS.

## Technical Approach

1.  **Audit:** Run Lighthouse in Chrome DevTools (incognito) or use PageSpeed Insights on key pages:
    -   Home Page (`/`)
    -   Listings Page (`/listings`)
    -   Car Detail Page (`/listings/[id]`)
2.  **Fix LCP:** Focus on the Hero section image on the Home page and the main car image on the Detail page.
3.  **Fix CLS:** Look for images without dimensions and late-loading content pushing content down.
4.  **Fix INP:** Reduce main thread blocking by optimizing hydration and reducing initial JS payload.

## Acceptance Criteria

- [ ] Lighthouse Performance score > 90 for Mobile and Desktop on key pages.
- [ ] No "layout shifts" visible during page load.
- [ ] Main LCP element loads immediately (no lazy loading on LCP).
- [ ] Fonts load without significant layout shift.
