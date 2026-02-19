# Development Guide

> Step-by-step guide to set up and run the Kaarplus project locally.  
> Derived from actual `package.json` scripts and `.env.example` files.

---

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | >=20.0.0 | `node --version` |
| npm | >=10.0.0 | `npm --version` |
| PostgreSQL | >=15.0 | `psql --version` |
| Git | Any | `git --version` |

**Recommended:** Use `nvm` to manage Node versions:
```bash
nvm use  # Uses version from .nvmrc (20)
```

---

## Quick Start

### 1. Clone and Navigate

```bash
git clone <repository-url> kaarplus
cd kaarplus
```

### 2. Install Dependencies

Uses pnpm as package manager (specified in `package.json`):

```bash
npm install
```

This installs dependencies for all workspaces:
- `apps/web`
- `apps/api`
- `packages/database`

### 3. Set Up Environment Variables

Copy example files to create local environment files:

```bash
# Backend environment
cp apps/api/.env.example apps/api/.env

# Frontend environment  
cp apps/web/.env.example apps/web/.env.local
```

### 4. Configure Environment Variables

#### Backend (`apps/api/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `PORT` | No | 4000 | API server port |
| `NODE_ENV` | No | development | Node environment |
| `CORS_ORIGIN` | Yes | http://localhost:3000 | Frontend URL for CORS |
| `JWT_SECRET` | Yes | - | JWT signing secret (min 32 chars) |
| `STRIPE_SECRET_KEY` | No | - | Stripe secret key (for payments) |
| `STRIPE_WEBHOOK_SECRET` | No | - | Stripe webhook secret |
| `AWS_S3_BUCKET` | No | - | S3 bucket name (for images) |
| `AWS_S3_REGION` | No | eu-central-1 | S3 region |
| `AWS_ACCESS_KEY_ID` | No | - | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | No | - | AWS IAM secret key |
| `SENDGRID_API_KEY` | No | - | SendGrid API key (for email) |
| `SENDGRID_FROM_EMAIL` | No | - | Verified sender email |
| `SENDGRID_FROM_NAME` | No | Kaarplus | Email sender name |
| `SENTRY_DSN` | No | - | Sentry DSN (for error tracking) |
| `MAX_INDIVIDUAL_LISTINGS` | No | 5 | Max listings per individual seller |
| `MAX_IMAGE_SIZE_BYTES` | No | 10485760 | Max image upload size (10MB) |
| `DISABLE_RATE_LIMIT` | No | false | Disable rate limiting (for E2E tests) |

**Minimum required `.env` for local development:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kaarplus
JWT_SECRET=your-secret-key-at-least-32-characters-long
CORS_ORIGIN=http://localhost:3000
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

#### Frontend (`apps/web/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | http://localhost:4000 | Backend API URL |
| `NEXT_PUBLIC_SITE_URL` | Yes | http://localhost:3000 | Frontend URL |
| `NEXTAUTH_URL` | Yes | http://localhost:3000 | NextAuth base URL |
| `NEXTAUTH_SECRET` | Yes | - | NextAuth secret (same as JWT_SECRET) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | - | Stripe publishable key |
| `NEXT_PUBLIC_S3_BUCKET` | No | - | S3 bucket name |
| `NEXT_PUBLIC_S3_REGION` | No | eu-central-1 | S3 region |
| `NEXT_PUBLIC_SENTRY_DSN` | No | - | Sentry DSN |
| `SENTRY_AUTH_TOKEN` | No | - | Sentry auth token (for source maps) |
| `NEXT_PUBLIC_COOKIE_CONSENT` | No | true | Enable cookie banner |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | No | false | Enable analytics |
| `NEXT_PUBLIC_GA_ID` | No | - | Google Analytics ID |

**Minimum required `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long
```

### 5. Set Up PostgreSQL

#### Option A: Docker (Recommended)

```bash
docker run --name kaarplus-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kaarplus \
  -p 5432:5432 \
  -d postgres:15
```

#### Option B: Local PostgreSQL

Ensure PostgreSQL is running and create the database:

```bash
createdb kaarplus
```

Update `DATABASE_URL` in `apps/api/.env` if using different credentials.

#### Verify Connection

```bash
pg_isready -h localhost -p 5432
```

### 6. Generate Prisma Client

```bash
npm run db:generate
```

This generates the Prisma client from the schema.

### 7. Run Database Migrations

```bash
npm run db:migrate
```

This creates all tables in the database. You will be prompted to create the first migration if the database is empty.

### 8. Seed the Database (Optional)

```bash
npm run db:seed
```

This populates the database with sample data for development.

### 9. Start Development Servers

```bash
# Start both web and API concurrently
npm run dev
```

Or start individually:
```bash
# Terminal 1 - Frontend
npm run dev:web

# Terminal 2 - Backend  
npm run dev:api
```

### 10. Verify Setup

| Service | URL | Expected Result |
|---------|-----|-----------------|
| Frontend | http://localhost:3000 | Kaarplus homepage loads |
| API Health | http://localhost:4000/api/health | `{"status":"ok"}` |
| Prisma Studio | Run `npm run db:studio` | Database GUI at http://localhost:5555 |

---

## Common Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps concurrently |
| `npm run dev:web` | Start frontend only |
| `npm run dev:api` | Start backend only |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (destructive!) |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint on all workspaces |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript type checking |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:e2e:ui` | Run E2E tests with UI |

### Build

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages |

---

## Workspace Commands

Run commands in specific workspaces:

```bash
# Run command in specific workspace
npm run <script> --workspace=apps/web
npm run <script> --workspace=apps/api
npm run <script> --workspace=packages/database

# Run in all workspaces
npm run <script> --workspaces --if-present
```

---

## Project Structure

```
kaarplus/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/        # App Router pages
│   │   │   ├── components/ # React components
│   │   │   ├── lib/        # Utilities, API client
│   │   │   ├── stores/     # Zustand stores
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── types/      # TypeScript types
│   │   │   └── messages/   # i18n translations
│   │   ├── public/         # Static assets
│   │   └── .env.local      # Frontend env (created by you)
│   │
│   └── api/                # Express backend
│       ├── src/
│       │   ├── routes/     # API route definitions
│       │   ├── controllers/# Request handlers
│       │   ├── services/   # Business logic
│       │   ├── middleware/ # Express middleware
│       │   ├── schemas/    # Zod validation schemas
│       │   ├── utils/      # Utilities
│       │   └── types/      # TypeScript types
│       └── .env            # Backend env (created by you)
│
├── packages/
│   ├── database/           # Prisma schema and client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── src/
│   │
│   ├── typescript-config/  # Shared TS configs
│   └── ui/                 # Shared UI components
│
├── docs/                   # Documentation
├── e2e/                    # Playwright E2E tests
├── .agent/                 # AI agent rules and workflows
└── stitch/                 # Design reference files
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check Docker container
docker ps | grep kaarplus-db

# View container logs
docker logs kaarplus-db

# Restart container
docker restart kaarplus-db
```

### Prisma Client Out of Sync

```bash
# Regenerate client
npm run db:generate

# If types are wrong, restart TypeScript server in IDE
```

### Port Conflicts

```bash
# Find processes on ports 3000/4000
lsof -ti:3000
lsof -ti:4000

# Kill processes
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Node Version Issues

```bash
# Check current version
node --version  # Should be >=20

# Switch to correct version
nvm use

# Or install correct version
nvm install 20
nvm use 20
```

### npm Install Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
```

### Migration Conflicts

```bash
# Reset database (dev only!)
npm run db:reset

# Or create a new migration to fix
npm run db:migrate
```

---

## Git Workflow

### Branch Naming

```
feat/<task-id>-<description>    # New features
fix/<task-id>-<description>     # Bug fixes
chore/<description>             # Maintenance
docs/<description>              # Documentation
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(web): add search filters [P1-T08]
fix(api): correct listing query [P1-T07]
chore(db): add seed data [P1-T02]
docs: update API documentation
```

**Scopes:** `web`, `api`, `db`, `auth`, `listings`, `search`, `payments`, `admin`, `seo`, `gdpr`, `infra`, `i18n`, `test`

---

## IDE Setup

### Recommended VS Code Extensions

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Prisma** - Prisma schema support
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Thunder Client** or **REST Client** - API testing

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

---

## Environment Variables Reference

### Required for Local Development

| Variable | Location | Value |
|----------|----------|-------|
| `DATABASE_URL` | `apps/api/.env` | `postgresql://postgres:postgres@localhost:5432/kaarplus` |
| `JWT_SECRET` | `apps/api/.env` | `openssl rand -base64 32` |
| `CORS_ORIGIN` | `apps/api/.env` | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | `apps/web/.env.local` | `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | `apps/web/.env.local` | `http://localhost:3000` |
| `NEXTAUTH_URL` | `apps/web/.env.local` | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | `apps/web/.env.local` | Same as `JWT_SECRET` |

### Optional Features

To enable additional features, add these variables:

**Image Uploads (AWS S3):**
```bash
AWS_S3_BUCKET=kaarplus-images
AWS_S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

**Payments (Stripe):**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Email (SendGrid):**
```bash
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@kaarplus.ee
```

**Error Tracking (Sentry):**
```bash
SENTRY_DSN=https://...sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...sentry.io/...
```

---

**Last Updated:** 2026-02-19  
**Source:** `package.json`, `apps/api/.env.example`, `apps/web/.env.example`
