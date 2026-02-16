# P5-T07: Final Integration Test & Quality Gate

> **Phase:** 5 — Production Readiness
> **Status:** ⬜ Not Started
> **Dependencies:** P5-T01 through P5-T06
> **Estimated Time:** 2 hours

## Problem Statement

Before declaring the project production-ready, a final comprehensive quality gate must pass. This is not a new feature — it's a verification task.

## Quality Gate Checklist

### Build & Lint
- [ ] `npm run lint` — zero errors, zero warnings (in project code)
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run build --workspaces --if-present` — all workspaces build successfully
- [ ] Zero console warnings during production build

### i18n Verification
- [ ] Navigate to `/` — switch to English → all text in English
- [ ] Navigate to `/` — switch to Russian → all text in Russian
- [ ] Navigate to `/listings` — verify filter labels, sort options translated
- [ ] Navigate to `/listings/[id]` — verify specs, price card, features translated
- [ ] Navigate to `/sell` — verify all wizard steps translated
- [ ] Navigate to `/dashboard` — verify stats, table headers translated
- [ ] Navigate to `/admin` — verify queue, analytics translated
- [ ] Navigate to `/compare` — verify comparison table translated
- [ ] Navigate to `/login` — verify form labels translated
- [ ] Navigate to `/register` — verify form labels translated
- [ ] Search for raw translation keys in rendered HTML — zero found

### Testing
- [ ] `npm run test --workspace=apps/api` — all unit tests pass
- [ ] `npm run test --workspace=apps/web` — all component tests pass
- [ ] `npx playwright test` — all E2E tests pass (zero skipped, zero failed)
- [ ] Coverage report shows >80% for API controllers

### Design Fidelity
- [ ] Each stitch reference compared and approved
- [ ] No broken images on any page
- [ ] Responsive layout works on mobile viewport (375px)
- [ ] Responsive layout works on tablet viewport (768px)
- [ ] Desktop layout works (1280px)

### SEO & Performance
- [ ] Each public page has unique `<title>` and `<meta description>`
- [ ] JSON-LD schema present on listing detail pages
- [ ] `sitemap.xml` accessible and valid
- [ ] `robots.txt` accessible and valid

### Functionality Smoke Test
- [ ] Register new user → success
- [ ] Login with credentials → success
- [ ] Browse listings → cards render with images
- [ ] Open car detail page → specs, price, gallery work
- [ ] Add to favorites → appears on /favorites
- [ ] Create listing (sell wizard) → appears in dashboard
- [ ] Compare 2 cars → comparison table renders
- [ ] Switch language → everything changes
- [ ] Admin login → can see pending listings
- [ ] Newsletter signup → no error

### Environment
- [ ] `.env.example` files complete
- [ ] `docs/DEPLOYMENT.md` exists with instructions
- [ ] `npm run dev` starts cleanly with no unexpected errors

## If Any Check Fails

Document the failure in this file (append to "Known Issues" section below) and create a follow-up fix before marking this task complete.

## Known Issues (To Be Filled During Audit)

_None yet — to be populated during final audit._

## Acceptance Criteria

- [ ] Every item in the Quality Gate Checklist above is checked ✅
- [ ] Any discovered issues have been fixed or documented with a remediation plan
- [ ] This task file is updated with the final audit results
