---
description: Start a new implementation task from the implementation plan
---

# Start Task Workflow

Use this workflow when beginning a new implementation task.

1. Read the implementation plan to find the next task:

```bash
cat docs/IMPLEMENTATION_PLAN.md
```

2. Identify the next uncompleted task (marked with ⬜). Confirm its dependencies are met (marked with ✅).

3. Read the task specification file:

```bash
cat docs/tasks/<TASK-ID>-<slug>.md
```

4. Review any related documentation:
   - `docs/ARCHITECTURE.md` for structural guidance
   - `docs/API.md` for endpoint specifications
   - `docs/DATABASE.md` for schema details
   - `docs/FEATURES.md` for feature details

5. Create a new git branch for the task:

```bash
git checkout -b feat/<task-id>-<short-description>
```

6. Implement the task following the specification.

7. After implementation, run quality checks:
   // turbo

```bash
npm run lint
```

// turbo

```bash
npm run typecheck
```

// turbo

```bash
npm run test
```

8. Update the task status in `docs/IMPLEMENTATION_PLAN.md` — change ⬜ to ✅.

9. Update the task status in the task file header — change "⬜ Not Started" to "✅ Complete".

10. Commit with conventional commit format:

```bash
git add -A && git commit -m "feat(<scope>): <description> [<TASK-ID>]"
```
