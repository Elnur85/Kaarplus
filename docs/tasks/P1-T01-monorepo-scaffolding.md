# P1-T01: Monorepo Scaffolding & Tooling

> **Phase:** 1 — Core MVP
> **Status:** ✅ Complete
> **Dependencies:** None
> **Estimated Time:** 3 hours

## Objective

Set up the monorepo foundation with npm workspaces, TypeScript configs, ESLint, Prettier, and all base configuration files so that subsequent tasks can scaffold apps on top of a solid foundation.

## Scope

### 1. Root Workspace Configuration

Create the root `package.json` with npm workspaces pointing to:

- `apps/web`
- `apps/api`
- `packages/database`
- `packages/typescript-config`
- `packages/ui`

Root scripts to define:

```json
{
  "dev": "concurrently \"npm run dev:web\" \"npm run dev:api\"",
  "dev:web": "npm run dev --workspace=apps/web",
  "dev:api": "npm run dev --workspace=apps/api",
  "build": "npm run build --workspaces",
  "lint": "npm run lint --workspaces --if-present",
  "lint:fix": "npm run lint:fix --workspaces --if-present",
  "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
  "typecheck": "npm run typecheck --workspaces --if-present",
  "test": "npm run test --workspaces --if-present",
  "db:generate": "npm run generate --workspace=packages/database",
  "db:migrate": "npm run migrate:dev --workspace=packages/database",
  "db:studio": "npm run studio --workspace=packages/database",
  "db:seed": "npm run seed --workspace=packages/database",
  "db:reset": "npm run migrate:reset --workspace=packages/database"
}
```

### 2. TypeScript Configuration (`packages/typescript-config/`)

Create shared configs:

- `base.json` — strict TypeScript settings
- `nextjs.json` — extends base, adds Next.js specifics
- `node.json` — extends base, adds Node.js specifics

### 3. Linting & Formatting

- ESLint config at root (flat config or `.eslintrc.js`)
  - TypeScript parser
  - React hooks rules
  - Import ordering
  - No unused vars (error)
- Prettier config (`.prettierrc`)
  - 2-space indent, single quotes, trailing commas, semicolons
- `.prettierignore`

### 4. Git Hooks (Optional — skip if Husky adds complexity)

- `lint-staged` configuration for pre-commit checks

### 5. Node Version

- `.nvmrc` with `20` (or `lts/*`)
- `engines` field in root `package.json`

### 6. Placeholder Package Files

Create minimal `package.json` in each workspace so `npm install` works:

- `apps/web/package.json`
- `apps/api/package.json`
- `packages/database/package.json`
- `packages/typescript-config/package.json`
- `packages/ui/package.json`

## Acceptance Criteria

- [ ] `npm install` succeeds from root without errors
- [ ] All workspaces are recognized (`npm ls --workspaces`)
- [ ] TypeScript configs are shareable across packages
- [ ] `npm run lint` and `npm run format` work (even if no source files yet)
- [ ] `.nvmrc` exists with Node 20+
- [ ] `.editorconfig` matches project conventions

## Files to Create/Modify

```
package.json (root)
.nvmrc
.prettierrc
.prettierignore
.eslintrc.js (or eslint.config.js)
packages/typescript-config/package.json
packages/typescript-config/base.json
packages/typescript-config/nextjs.json
packages/typescript-config/node.json
packages/database/package.json
packages/ui/package.json
apps/web/package.json (placeholder)
apps/api/package.json (placeholder)
```

## Notes

- Do NOT install Next.js or Express yet — those are scaffolded in T03 and T04
- The database package will be fully set up in P1-T02
- Keep everything minimal — just enough for the monorepo to function
