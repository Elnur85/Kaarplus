# Deployment Guide

Kaarplus is deployed as a monorepo with separate hosting targets for the frontend, backend, and database.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Production                               │
│                                                                  │
│  ┌──────────────────┐       ┌──────────────────────────────┐    │
│  │   Vercel (Web)   │──────▶│   Railway (API)              │    │
│  │   apps/web       │       │   apps/api  · Port 4000      │    │
│  │   Port 443       │       └──────────────┬───────────────┘    │
│  └──────────────────┘                      │                    │
│                                            ▼                    │
│  ┌─────────────────┐       ┌──────────────────────────────┐    │
│  │  Cloudflare DNS │       │   Railway PostgreSQL 15+      │    │
│  │  / CDN          │       │   packages/database           │    │
│  └─────────────────┘       └──────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   AWS S3  eu-central-1  (kaarplus-images bucket)         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

| Service      | Provider       | Region          | Purpose                |
|--------------|----------------|-----------------|------------------------|
| Frontend     | Vercel         | Auto (Edge)     | Next.js SSR/SSG        |
| Backend API  | Railway        | eu-central-1    | Express server         |
| Database     | Railway / Supabase | eu-central-1 | PostgreSQL 15+        |
| File Storage | AWS S3         | eu-central-1    | Vehicle images         |
| DNS / CDN    | Cloudflare     | Global          | DNS, DDoS, SSL         |
| Email        | SendGrid       | Global          | Transactional emails   |
| Payments     | Stripe         | Global          | Card / Apple / Google Pay |

---

## Prerequisites

- **Node.js 20+** (see `.nvmrc`)
- **npm 10+**
- Accounts on: Vercel, Railway, AWS, Stripe, SendGrid, Cloudflare

---

## Environment Variables

### Frontend — Vercel (`apps/web`)

Set these in **Vercel → Project → Settings → Environment Variables** for each target environment.

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://api.kaarplus.ee` | Express backend URL |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://kaarplus.ee` | Canonical site URL |
| `NEXTAUTH_URL` | ✅ | `https://kaarplus.ee` | Must match site URL |
| `NEXTAUTH_SECRET` | ✅ | *(random 32-byte hex)* | JWT signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | `pk_live_...` | Stripe publishable key |
| `NEXT_PUBLIC_S3_BUCKET` | ✅ | `kaarplus-images` | S3 bucket name |
| `NEXT_PUBLIC_S3_REGION` | ✅ | `eu-central-1` | AWS region |
| `NEXT_PUBLIC_COOKIE_CONSENT` | ➖ | `true` | Enable cookie banner |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | ➖ | `true` | Enable analytics |
| `NEXT_PUBLIC_GA_ID` | ➖ | `G-XXXXXXXXXX` | Google Analytics ID |

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Backend — Railway (`apps/api`)

Set these in **Railway → Service → Variables**.

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | `postgresql://...` | PostgreSQL connection string |
| `PORT` | ✅ | `4000` | Server port (Railway sets this automatically) |
| `NODE_ENV` | ✅ | `production` | Node environment |
| `CORS_ORIGIN` | ✅ | `https://kaarplus.ee` | Allowed frontend origin |
| `JWT_SECRET` | ✅ | *(same as NEXTAUTH_SECRET)* | JWT verification secret |
| `STRIPE_SECRET_KEY` | ✅ | `sk_live_...` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | `whsec_...` | Stripe webhook signing secret |
| `AWS_S3_BUCKET` | ✅ | `kaarplus-images` | S3 bucket name |
| `AWS_S3_REGION` | ✅ | `eu-central-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | ✅ | `AKIA...` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | ✅ | *(secret)* | IAM secret key |
| `SENDGRID_API_KEY` | ✅ | `SG....` | SendGrid API key |
| `SENDGRID_FROM_EMAIL` | ✅ | `noreply@kaarplus.ee` | Verified sender email |
| `SENDGRID_FROM_NAME` | ✅ | `Kaarplus` | Email sender name |
| `MAX_INDIVIDUAL_LISTINGS` | ➖ | `5` | Per-seller listing cap |
| `MAX_IMAGE_SIZE_BYTES` | ➖ | `10485760` | Max upload size (10 MB) |

---

## Database Setup

### Initial Setup (First Deploy)

```bash
# 1. Run migrations to create all tables
npm run db:migrate

# 2. Generate Prisma client
npm run db:generate

# 3. (Optional) Seed with sample data — development only
npm run db:seed
```

### Migrations on Subsequent Deploys

Migrations are applied automatically via the Railway deploy command (see below). For manual application:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

> ⚠️ **Never** use `prisma db push` in production. Always use `prisma migrate deploy`.

### Rollback

Prisma does not support automatic rollbacks. To revert:
1. Identify the migration to revert in `packages/database/prisma/migrations/`
2. Manually apply the inverse SQL via `psql` or Prisma Studio
3. Delete the migration file and create a new migration

---

## Frontend Deployment (Vercel)

### Initial Setup

1. **Import repository** at [vercel.com/new](https://vercel.com/new)
2. Set **Framework Preset** to `Next.js`
3. Set **Root Directory** to `apps/web`
4. Configure environment variables (see table above)
5. Click **Deploy**

### Build Command (auto-detected)

```bash
next build
```

### Output Directory (auto-detected)

```
.next
```

### Automatic Deployments

- **Production:** Push to `main` branch
- **Preview:** Open any pull request

### Custom Domain

1. Vercel → Project → Settings → Domains
2. Add `kaarplus.ee` and `www.kaarplus.ee`
3. Update Cloudflare DNS with Vercel's CNAME/A records
4. Enable **Cloudflare proxy** (orange cloud) for DDoS protection

---

## Backend Deployment (Railway)

### Initial Setup

1. Create a new **Railway project**
2. Add a **GitHub** service pointing to the repository
3. Set **Root Directory** to `apps/api`
4. Set **Start Command**:

```bash
npm run build && npx prisma migrate deploy && npm run start
```

5. Configure environment variables (see table above)
6. Railway auto-assigns a public URL — set `CORS_ORIGIN` on the frontend to this URL

### Build Command

```bash
npm run build
```

### Start Command

```bash
node dist/index.js
```

> The full deploy command (`build → migrate → start`) ensures migrations run before traffic is accepted.

### Health Check

Railway automatically monitors:
```
GET /api/health  →  200 OK  {"status":"ok","env":"production"}
```

Configure in Railway → Service → Settings → Health Check Path: `/api/health`

---

## AWS S3 Setup

### Create Bucket

```bash
aws s3api create-bucket \
  --bucket kaarplus-images \
  --region eu-central-1 \
  --create-bucket-configuration LocationConstraint=eu-central-1
```

### Bucket Policy (public read for images)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::kaarplus-images/listings/*"
    }
  ]
}
```

### IAM Policy for API server

Create an IAM user with this policy (never use root credentials):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:GetPresignedUrl"
      ],
      "Resource": "arn:aws:s3:::kaarplus-images/*"
    }
  ]
}
```

### CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://kaarplus.ee", "https://www.kaarplus.ee"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## Stripe Setup

### Webhook Configuration

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. **Endpoint URL:** `https://api.kaarplus.ee/api/webhooks/stripe`
3. **Events to listen for:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created` *(future)*
4. Copy the **Signing Secret** → set as `STRIPE_WEBHOOK_SECRET`

### Live Key Checklist

- [ ] Switch from `pk_test_` / `sk_test_` to `pk_live_` / `sk_live_` keys
- [ ] Update webhook endpoint to production URL
- [ ] Enable Apple Pay domain verification in Stripe Dashboard

---

## SendGrid Setup

1. Create API key: SendGrid → Settings → API Keys → Create API Key
2. **Permissions:** Mail Send (Full Access)
3. **Sender Authentication:** Verify `kaarplus.ee` domain
4. Set `SENDGRID_FROM_EMAIL` to a verified address

---

## CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test

  build-web:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
```

### Deploy Gates

| Gate | Blocks Deploy |
|------|--------------|
| TypeScript errors | ✅ |
| ESLint errors | ✅ |
| Unit test failures | ✅ |
| E2E failures | ✅ (main only) |

---

## Production Checklist

### Before First Deploy

- [ ] All environment variables set in Vercel and Railway
- [ ] Domain configured with Cloudflare
- [ ] SSL certificates issued (automatic via Vercel/Railway + Cloudflare)
- [ ] S3 bucket created with correct policy and CORS
- [ ] SendGrid domain verified
- [ ] Stripe live keys configured with production webhook
- [ ] `NEXTAUTH_SECRET` and `JWT_SECRET` are the same strong random value
- [ ] `NODE_ENV=production` set on Railway

### Database

- [ ] Production database created (Railway PostgreSQL or Supabase)
- [ ] `DATABASE_URL` set in Railway variables
- [ ] `npm run db:migrate` run against production database
- [ ] Database backups enabled (daily minimum)
- [ ] Connection pooling configured (PgBouncer or Supabase built-in)

### Security

- [ ] CORS locked to production domain only
- [ ] Rate limiting enabled (express-rate-limit)
- [ ] Helmet.js security headers active
- [ ] No `console.log` with sensitive data in production code
- [ ] Stripe webhook signature verification active
- [ ] S3 bucket does NOT have public write access

### SEO / Performance

- [ ] `robots.txt` accessible at `https://kaarplus.ee/robots.txt`
- [ ] `sitemap.xml` accessible at `https://kaarplus.ee/sitemap.xml`
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] All images have `alt` text
- [ ] JSON-LD structured data validates at [schema.org/validator](https://validator.schema.org/)

### GDPR

- [ ] Cookie consent banner active
- [ ] Privacy policy accessible at `/privacy`
- [ ] `GET /api/user/gdpr/export` endpoint working
- [ ] `DELETE /api/user/gdpr/delete` endpoint working
- [ ] Data Processing Agreement signed with all processors

---

## Monitoring

### Recommended Stack

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| Railway built-in | API logs, metrics | ✅ |
| Vercel Analytics | Frontend performance | ✅ |
| Sentry | Error tracking | ✅ (5k errors/month) |
| UptimeRobot | Uptime monitoring | ✅ |
| Stripe Dashboard | Payment monitoring | ✅ |

### Key Endpoints to Monitor

```
GET https://kaarplus.ee              → 200 OK
GET https://api.kaarplus.ee/api/health  → 200 OK {"status":"ok"}
```

---

## Rollback Procedure

### Frontend (Vercel)

1. Vercel Dashboard → Deployments
2. Find last good deployment
3. Click **...** → **Promote to Production**

Rollback completes in < 30 seconds.

### Backend (Railway)

1. Railway Dashboard → Deployments
2. Find last good deployment
3. Click **Redeploy**

> If a breaking migration was applied, you must also manually reverse the database change before rolling back the API.

### Database

There is no automatic database rollback. Follow the manual migration revert process described in the [Database Setup](#database-setup) section.

---

## Scaling

### Horizontal Scaling

- **Frontend (Vercel):** Automatic — serverless, scales to zero and up
- **Backend (Railway):** Add replicas in Railway → Service → Settings → Replicas
- **Database:** Upgrade Railway tier or migrate to Supabase / RDS for read replicas

### When to Scale

| Metric | Threshold | Action |
|--------|-----------|--------|
| API P95 latency | > 500ms | Add Railway replica |
| DB CPU | > 70% sustained | Upgrade DB tier |
| DB connections | > 80% pool | Add PgBouncer |
| S3 bandwidth | > 1 TB/month | Enable CloudFront CDN |

---

## Useful Commands

```bash
# Check production API health
curl https://api.kaarplus.ee/api/health

# Run production migration (with DATABASE_URL set)
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Tail Railway logs
railway logs --tail

# Check Vercel deployment status
vercel ls

# Force redeploy on Vercel
vercel --prod
```
