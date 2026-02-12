# Feature Specifications

## Implementation Priority

### Phase 1 - Core MVP

1. Project scaffolding (monorepo, configs, CI)
2. Database schema + Prisma setup
3. Authentication (register, login, sessions)
4. Landing page with search
5. Car listings page (list + grid views, filters, pagination)
6. Car detail page (gallery, specs, contact)
7. Sell vehicle wizard (multi-step form + photo upload)
8. Admin listing verification queue
9. Basic SEO (meta tags, sitemap, structured data)
10. GDPR compliance (consent banner, privacy policy)

### Phase 2 - Engagement

11. Favorites system
12. Car comparison page
13. Advanced search page
14. Saved searches (with email alerts)
15. User dashboard (overview, my listings, settings)
16. Messaging system (buyer-seller)
17. Email notifications (transactional)
18. Newsletter signup

### Phase 3 - Monetization

19. Stripe payment integration
20. Premium listing options
21. Dealership accounts
22. Analytics dashboard (admin)

### Phase 4 - Polish

23. i18n (Estonian + English + Russian)
24. Performance optimization (Core Web Vitals)
25. E2E test suite
26. Error tracking (Sentry)
27. Monitoring and alerting

## Page Specifications

### Landing Page (/)

- Hero carousel with ratings
- Search bar: Make, Model, Year, Fuel, Price, Transmission
- Category quick links: Micro, Sedan, Hatchback, Family, Sport, SUV, Truck, Van
- 4 value proposition blocks
- Popular brands grid (8+ logos with counts)
- Customer testimonials carousel
- Statistics section
- FAQ accordion
- Newsletter signup
- Full footer

### Listings (/cars)

- Sidebar filters with active filter badges
- Sort: Newest, Oldest, Price Low→High, Price High→Low
- View toggle: List / Grid
- List view: horizontal cards with image, title, specs, price
- Grid view: 4-column responsive, vertical cards
- URL-based filter state (shareable URLs)
- Pagination
- Compare mode (select up to 4-5 cars)

### Car Detail (/cars/[id]/[slug])

- Breadcrumbs
- Image gallery with lightbox (8+ thumbnails)
- Sidebar: price, VAT status, deal badge, contact buttons, seller info
- Tabs: basic info, full description, features, price history
- Related cars section

### Sell Vehicle (/sell)

- 4-step wizard with progress indicator
- Step 1: Vehicle type selection
- Step 2: Vehicle data form (contact, specs, equipment checkboxes)
- Step 3: Photo upload (drag-drop, 3-30 photos, 10MB max each)
- Step 4: Success confirmation

### Comparison (/compare)

- Side-by-side table (max 4 cars)
- Toggle: show differences only / show all
- Removable car columns
- Feature checkmark comparison

### Favorites (/favorites)

- Grid of saved cars
- Select mode for bulk actions
- Compare selected, remove, share

### Dashboard (/dashboard)

- Overview stats
- Active listings tab
- Messages inbox
- Settings (profile, password, GDPR)

## User Role Matrix

| Feature          | Guest | Buyer | Ind. Seller | Dealership | Support | Admin |
| ---------------- | ----- | ----- | ----------- | ---------- | ------- | ----- |
| Browse listings  | Yes   | Yes   | Yes         | Yes        | Yes     | Yes   |
| View car details | Yes   | Yes   | Yes         | Yes        | Yes     | Yes   |
| Search / filter  | Yes   | Yes   | Yes         | Yes        | Yes     | Yes   |
| Save favorites   | No    | Yes   | Yes         | Yes        | Yes     | Yes   |
| Compare cars     | No    | Yes   | Yes         | Yes        | Yes     | Yes   |
| Save searches    | No    | Yes   | Yes         | Yes        | Yes     | Yes   |
| Message sellers  | No    | Yes   | Yes         | Yes        | Yes     | Yes   |
| Create listings  | No    | No    | 5 max       | Unlimited  | No      | Yes   |
| Upload photos    | No    | No    | Yes         | Yes        | No      | Yes   |
| Verify listings  | No    | No    | No          | No         | Yes     | Yes   |
| Manage users     | No    | No    | No          | No         | No      | Yes   |
| View analytics   | No    | No    | No          | No         | No      | Yes   |
