# Development Guide

## Prerequisites

- **Node.js 20+** — install via [nvm](https://github.com/nvm-sh/nvm): `nvm install 20`
- **PostgreSQL 15+** — local instance or Docker
- **npm 10+** — comes with Node.js 20
- **Git** — for version control

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> && cd kaarplus

# 2. Use correct Node version
nvm use

# 3. Install dependencies
npm install

# 4. Set up environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp packages/database/.env.example packages/database/.env

# 5. Start PostgreSQL (Docker option)
docker run --name kaarplus-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kaarplus \
  -p 5432:5432 -d postgres:15

# 6. Set up database
npm run db:generate
npm run db:migrate
npm run db:seed

# 7. Start development
npm run dev
```

**Frontend:** http://localhost:3000
**Backend:** http://localhost:4000/api/health
**Prisma Studio:** `npm run db:studio` (port 5555)

## Project Structure

This is an **npm workspaces monorepo** with the following packages:

| Package                       | Path                         | Description            |
| ----------------------------- | ---------------------------- | ---------------------- |
| `@kaarplus/web`               | `apps/web`                   | Next.js 14+ frontend   |
| `@kaarplus/api`               | `apps/api`                   | Express.js backend API |
| `@kaarplus/database`          | `packages/database`          | Prisma schema & client |
| `@kaarplus/typescript-config` | `packages/typescript-config` | Shared TS configs      |
| `@kaarplus/ui`                | `packages/ui`                | Shared UI components   |

## Common Commands

| Command               | Description                   |
| --------------------- | ----------------------------- |
| `npm run dev`         | Start all apps concurrently   |
| `npm run dev:web`     | Start frontend only           |
| `npm run dev:api`     | Start backend only            |
| `npm run build`       | Build all packages            |
| `npm run lint`        | Lint all packages             |
| `npm run typecheck`   | TypeScript check              |
| `npm run test`        | Run all tests                 |
| `npm run db:generate` | Regenerate Prisma client      |
| `npm run db:migrate`  | Run pending migrations        |
| `npm run db:studio`   | Open Prisma Studio GUI        |
| `npm run db:seed`     | Seed database with test data  |
| `npm run db:reset`    | Reset database (destructive!) |

## Environment Variables

### Backend (`apps/api/.env`)

| Variable                | Required | Description                   |
| ----------------------- | -------- | ----------------------------- |
| `DATABASE_URL`          | Yes      | PostgreSQL connection string  |
| `JWT_SECRET`            | Yes      | Secret for JWT signing        |
| `CORS_ORIGIN`           | Yes      | Frontend URL for CORS         |
| `PORT`                  | No       | API port (default: 4000)      |
| `STRIPE_SECRET_KEY`     | Phase 3  | Stripe API key                |
| `STRIPE_WEBHOOK_SECRET` | Phase 3  | Stripe webhook signing secret |
| `AWS_S3_BUCKET`         | Phase 1  | S3 bucket name                |
| `AWS_S3_REGION`         | Phase 1  | S3 region                     |
| `AWS_ACCESS_KEY_ID`     | Phase 1  | AWS credentials               |
| `AWS_SECRET_ACCESS_KEY` | Phase 1  | AWS credentials               |
| `SENDGRID_API_KEY`      | Phase 2  | SendGrid API key              |

### Frontend (`apps/web/.env.local`)

| Variable                             | Required | Description               |
| ------------------------------------ | -------- | ------------------------- |
| `NEXT_PUBLIC_API_URL`                | Yes      | Backend API URL           |
| `NEXTAUTH_URL`                       | Yes      | Frontend URL for NextAuth |
| `NEXTAUTH_SECRET`                    | Yes      | NextAuth session secret   |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Phase 3  | Stripe publishable key    |

## Git Workflow

### Branch Naming

```
feat/<task-id>-<description>   # New features
fix/<task-id>-<description>    # Bug fixes
chore/<description>            # Maintenance
docs/<description>             # Documentation
```

### Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat(web): implement landing page hero section [P1-T06]
fix(api): correct listing filter query for price range [P1-T07]
chore(db): add seed data for testing [P1-T02]
docs: update API documentation
```

**Scopes:** `web`, `api`, `db`, `auth`, `listings`, `search`, `payments`, `admin`, `seo`, `gdpr`, `infra`

## Testing

- **Unit tests:** Vitest — colocated `*.test.ts` files
- **E2E tests:** Playwright — in `apps/web/e2e/`
- Run: `npm run test` (unit) or `npm run test:e2e` (E2E)

## Troubleshooting

### Database connection issues

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Reset database completely
npm run db:reset
```

### Prisma client out of sync

```bash
npm run db:generate
```

### Port conflicts

Kill processes on ports 3000/4000:

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```
