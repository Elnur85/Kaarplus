# P1-T08: Car Listings Page (List/Grid + Filters)

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T04, P1-T07
> **Estimated Time:** 5 hours

## Objective

Build the car listings browsing page with sidebar filters, sort controls, list/grid view toggle, car cards, and pagination. Filter state persists in URL query parameters.

## Scope

### Layout

- Left sidebar (collapsible on mobile): filter panel
- Main content area: sort bar + results + pagination

### Sidebar Filters

- Make dropdown (populated from API)
- Model dropdown (dependent on Make)
- Body Type multi-select
- Year range (min/max inputs or slider)
- Price range (min/max inputs or slider)
- Fuel Type checkboxes
- Transmission radio (All, Manual, Automatic)
- Color selection
- Clear all filters button
- Active filter badges (removable)

### Sort & View Controls

- Sort dropdown: Newest, Oldest, Price Low→High, Price High→Low
- View toggle: List / Grid (icon buttons)
- Results count text: "Showing X of Y cars"

### Car Cards

**List View (horizontal):**

- Image (left), Title + specs (center), Price + actions (right)
- Specs: Year, Mileage, Fuel, Transmission, Power
- Verified badge if `verifiedAt` is set
- Favorite button (heart icon)

**Grid View (vertical):**

- 4 columns on desktop, 2 on tablet, 1 on mobile
- Larger image, title, key specs, price

### Pagination

- Page numbers with prev/next buttons
- Show current page and total pages
- URL-based (`?page=2`)

### URL State Management

All filter/sort/view state stored in URL search params:

- `?make=BMW&model=3+Series&priceMin=5000&sort=price_asc&view=grid&page=1`
- Shareable URLs
- Back/forward browser navigation works

### Data Fetching

- Server-side fetch for initial load (SEO)
- Client-side updates on filter/sort changes
- Loading skeleton while fetching

## Acceptance Criteria

- [ ] Filters update results in real-time
- [ ] URL reflects current filter state
- [ ] List and grid views work correctly
- [ ] Pagination navigates correctly
- [ ] Cards show all required information
- [ ] Mobile responsive (sidebar collapses)
- [ ] Loading states shown during data fetch
- [ ] Empty state for no results

## Components to Create

```
components/listings/
├── filter-sidebar.tsx
├── filter-badge.tsx
├── sort-controls.tsx
├── view-toggle.tsx
├── car-card-list.tsx
├── car-card-grid.tsx
├── car-card-skeleton.tsx
├── pagination.tsx
└── results-count.tsx
```
