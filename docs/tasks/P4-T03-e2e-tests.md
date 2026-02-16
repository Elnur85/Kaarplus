# P4-T03: E2E Test Suite (Playwright)

> **Phase:** 4 — Polish & Scale
> **Status:** ✅ Complete
> **Dependencies:** Phase 1
> **Estimated Time:** 4 hours

## Objective

Set up and implement a comprehensive End-to-End (E2E) testing suite using Playwright to ensure critical user flows are functioning correctly and prevent regressions.

## Requirements

### 1. Setup
- [ ] Install Playwright (`npm init playwright@latest`).
- [ ] Configure Playwright for CI execution (headless).
- [ ] Set up `test` script in `package.json`.

### 2. Critical User Flows
- [ ] **Authentication**:
    -   Register a new user.
    -   Login with existing credentials.
    -   Logout.
- [ ] **Seller Flow**:
    -   Navigate to `/sell`.
    -   Complete the multi-step wizard (Vehicle Details, Photos, Pricing, Contact).
    -   Submit listing for verification.
- [ ] **Buyer Flow**:
    -   Browse listings on `/listings`.
    -   Use filters (Make, Model, Price).
    -   View listing details.
    -   Contact seller via message form.
- [ ] **Admin Flow**:
    -   Login as Admin.
    -   View pending listings queue.
    -   Approve/Reject a listing.

### 3. Test Data Management
- [ ] Use a test database or seeded data for reliable tests.
- [ ] Ensure cleanup after tests run.

## Technical Approach

-   Use Page Object Model (POM) pattern for maintainability.
-   Store test files in `tests/e2e`.
-   Use `dotenv` for test environment variables.
-   Run tests against `localhost:3000`.

## Acceptance Criteria

- [ ] All critical flows listed above have passing tests.
- [ ] Tests run successfully in local environment.
- [ ] `npm run test:e2e` command executes the suite.
