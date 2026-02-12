# P1-T03: Express API Server Boilerplate

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T01
> **Estimated Time:** 2 hours

## Objective

Scaffold the Express.js backend application with TypeScript, middleware pipeline, error handling, health check endpoint, and proper project structure.

## Scope

### 1. Express App Setup

In `apps/api`:

- Install Express, TypeScript, ts-node-dev, cors, helmet, etc.
- Create `src/index.ts` — app entry point
- Create `src/app.ts` — Express app configuration
- Configure dev server with hot reload (ts-node-dev or tsx)

### 2. Middleware Pipeline

Implement in `src/middleware/`:

- `cors.ts` — CORS configuration (allow `CORS_ORIGIN` env var)
- `helmet.ts` — Security headers
- `rateLimiter.ts` — Rate limiting per endpoint pattern
- `errorHandler.ts` — Global error handler with consistent response format
- `auth.ts` — JWT verification middleware (stub — fully implemented in P1-T05)
- `validate.ts` — Zod schema validation middleware

### 3. Route Structure

Create route files (empty routers, handlers added in later tasks):

- `src/routes/index.ts` — route registry
- `src/routes/auth.ts` — auth routes (stub)
- `src/routes/listings.ts` — listing routes (stub)
- `src/routes/search.ts` — search routes (stub)
- `src/routes/user.ts` — user routes (stub)
- `src/routes/payments.ts` — payment routes (stub)
- `src/routes/admin.ts` — admin routes (stub)
- `src/routes/webhooks.ts` — webhook routes (stub)

### 4. Utilities

- `src/utils/logger.ts` — structured logging (console for now, Pino later)
- `src/utils/errors.ts` — custom error classes (AppError, ValidationError, AuthError, NotFoundError)
- `src/types/express.d.ts` — extend Express Request with user object

### 5. Health Check

- `GET /api/health` — returns `{ status: "ok", version: "1.0.0", timestamp: ... }`

### 6. Scripts

```json
{
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "lint": "eslint src/",
  "typecheck": "tsc --noEmit"
}
```

## Acceptance Criteria

- [ ] `npm run dev:api` starts the server on port 4000
- [ ] `GET http://localhost:4000/api/health` returns 200
- [ ] CORS headers present in responses
- [ ] Global error handler catches and formats errors
- [ ] Rate limiter is configured (but not blocking in dev)
- [ ] Zod validation middleware works on a test route

## Files to Create/Modify

```
apps/api/package.json
apps/api/tsconfig.json
apps/api/src/index.ts
apps/api/src/app.ts
apps/api/src/middleware/cors.ts
apps/api/src/middleware/helmet.ts
apps/api/src/middleware/rateLimiter.ts
apps/api/src/middleware/errorHandler.ts
apps/api/src/middleware/auth.ts (stub)
apps/api/src/middleware/validate.ts
apps/api/src/routes/index.ts
apps/api/src/routes/auth.ts (stub)
apps/api/src/routes/listings.ts (stub)
apps/api/src/routes/search.ts (stub)
apps/api/src/routes/user.ts (stub)
apps/api/src/routes/payments.ts (stub)
apps/api/src/routes/admin.ts (stub)
apps/api/src/routes/webhooks.ts (stub)
apps/api/src/controllers/ (empty dir)
apps/api/src/services/ (empty dir)
apps/api/src/utils/logger.ts
apps/api/src/utils/errors.ts
apps/api/src/types/express.d.ts
apps/api/.env.example
```
