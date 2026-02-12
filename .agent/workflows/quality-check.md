---
description: Run all quality checks (lint, typecheck, test, build)
---

# Quality Check Workflow

Run this workflow after making code changes to ensure everything passes.

// turbo-all

1. Run the linter:

```bash
npm run lint --workspaces --if-present
```

2. Run TypeScript type checking:

```bash
npm run typecheck --workspaces --if-present
```

3. Run unit tests:

```bash
npm run test --workspaces --if-present
```

4. Attempt a production build to catch build errors:

```bash
npm run build --workspaces --if-present
```

5. If any step fails, fix the issues before proceeding.

6. Report all results back to the user.
