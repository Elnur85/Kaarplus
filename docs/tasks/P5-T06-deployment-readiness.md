# P5-T06: Environment Documentation & Deployment Readiness

> **Phase:** 5 — Production Readiness
> **Status:** ✅ Completed
> **Dependencies:** All previous
> **Estimated Time:** 2 hours

## Problem Statement

The project lacks comprehensive deployment documentation. Environment variables are scattered, deployment targets (Vercel, Railway) aren't configured, and there's no runbook for launching.

## Implementation Steps

### Step 1: Complete `.env.example` Files

**`apps/api/src/.env.example`:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kaarplus

# Authentication
JWT_SECRET=your-secret-key-here

# AWS S3 (Photo Upload)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=kaarplus-uploads
AWS_REGION=eu-north-1

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (Email)
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@kaarplus.ee

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**`apps/web/.env.example`:**
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:4000

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
```

### Step 2: Create Deployment Guide

Create `docs/DEPLOYMENT.md`:
- Vercel setup for `apps/web` (environment variables, build command)
- Railway/Render setup for `apps/api` (Dockerfile or buildpack)
- PostgreSQL provisioning (Supabase, Neon, or Railway)
- S3 bucket setup
- Stripe account configuration
- SendGrid setup
- Sentry project setup
- Domain configuration

### Step 3: Create Docker Support (Optional)

Create `apps/api/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npx prisma generate
CMD ["node", "dist/index.js"]
```

### Step 4: Add Health Check Docs

Document all health/status endpoints:
- `GET /api/health` — API health check
- `GET /api/mobile/version` — App version info

## Acceptance Criteria

- [ ] `.env.example` files list EVERY required variable with descriptions
- [ ] `docs/DEPLOYMENT.md` has step-by-step deployment instructions
- [ ] Production build succeeds with all env vars set
- [ ] Health check endpoint returns valid response
