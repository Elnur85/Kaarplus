# P4-T05: CI/CD Pipeline (GitHub Actions)

> **Phase:** 4 — Polish & Scale
> **Status:** ✅ Complete
> **Dependencies:** P1-T01
> **Estimated Time:** 2 hours

## Objective

Set up a robust CI/CD pipeline using GitHub Actions to automate quality checks and prepare for deployment.

## Requirements

### 1. Continuous Integration (CI)
- [ ] Create `.github/workflows/ci.yml`.
- [ ] Trigger on `push` to `main` and `pull_request` to `main`.
- [ ] Job 1: **Quality Check**
    -   Checkout code.
    -   Setup Node.js (v20).
    -   Install dependencies (`npm ci`).
    -   Run Lint (`npm run lint`).
    -   Run Typecheck (`npm run typecheck`).
    -   Run Unit Tests (`npm run test`).
- [ ] Job 2: **E2E Tests** (Optional/Advanced)
    -   Setup Playwright.
    -   Run `npm run test:e2e` (might require running app in background).

### 2. Continuous Deployment (CD) guidance
-   Verify Vercel and Railway integration documentation.
-   Ensure PR previews are enabled on Vercel.

## Technical Details

-   Use `actions/checkout@v4`.
-   Use `actions/setup-node@v4`.
-   Cache `node_modules` for speed.

## Acceptance Criteria

- [ ] A PR to `main` triggers the CI workflow.
- [ ] CI fails if linting, typechecking, or tests fail.
- [ ] CI passes if all checks pass.
