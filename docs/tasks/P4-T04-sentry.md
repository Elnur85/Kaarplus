# P4-T04: Error Tracking (Sentry Integration)

> **Phase:** 4 — Polish & Scale
> **Status:** ✅ Complete
> **Dependencies:** P1-T01
> **Estimated Time:** 2 hours

## Objective

Integrate Sentry for real-time error tracking and performance monitoring across both the Web (Next.js) and API (Express) applications.

## Requirements

### 1. Web (Next.js) Integration
- [ ] Install `@sentry/nextjs`.
- [ ] Run Sentry wizard or configure manually (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`).
- [ ] Update `next.config.mjs` to include Sentry webpack plugin.
- [ ] Configure source maps (ensure they are uploaded but not public if possible, or use Sentry auth token).
- [ ] Create a testing page `/sentry-test-error` to verify integration.
- [ ] Ensure sensitive data is scrubbed.
- [ ] Verify environment variables (`SENTRY_DSN`, `SENTRY_AUTH_TOKEN`).

### 2. API (Express) Integration
- [ ] Install `@sentry/node` and `@sentry/profiling-node`.
- [ ] Initialize Sentry at the very top of the main server file (`apps/api/src/index.ts` or similar).
- [ ] Add Sentry RequestHandler (must be first middleware).
- [ ] Add Sentry ErrorHandler (must be before any other error middleware).
- [ ] Verify with a test route `/debug-sentry`.

## Technical Details

-   **Web DSN**: Use env var `NEXT_PUBLIC_SENTRY_DSN`.
-   **API DSN**: Use env var `SENTRY_DSN`.
-   **Environment**: Should distinguish between `development`, `preview`, and `production`.

## Acceptance Criteria

- [ ] Sentry is initialized in Next.js (Client & Server).
- [ ] Sentry is initialized in Express API.
- [ ] Triggering an error on Web sends an event to Sentry.
- [ ] Triggering an error on API sends an event to Sentry.
- [ ] Build process includes Sentry upload (or is configured to do so in CI).
