---
description: Set up the local development environment from scratch
---

# Dev Setup Workflow

Use this workflow to set up the development environment for the first time.

1. Verify Node.js version:
   // turbo

```bash
node --version
```

Ensure it is 20+. If not, run `nvm use` or install the correct version.

2. Install dependencies:

```bash
npm install
```

3. Set up environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp packages/database/.env.example packages/database/.env
```

4. Ensure PostgreSQL is running locally. If using Docker:

```bash
docker run --name kaarplus-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kaarplus -p 5432:5432 -d postgres:15
```

5. Generate Prisma client:
   // turbo

```bash
npm run db:generate
```

6. Run database migrations:

```bash
npm run db:migrate
```

7. Seed the database with sample data:

```bash
npm run db:seed
```

8. Start the development servers:

```bash
npm run dev
```

9. Verify:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000/api/health
   - Prisma Studio: run `npm run db:studio` in a separate terminal
