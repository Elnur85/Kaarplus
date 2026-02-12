---
description: Review current project status and what to work on next
---

# Status Check Workflow

Use this workflow to review project status and determine next steps.

1. Check the implementation plan for current progress:
   // turbo

```bash
cat docs/IMPLEMENTATION_PLAN.md
```

2. Look for the current phase and any in-progress tasks.

3. Check git status for any uncommitted work:
   // turbo

```bash
git status
```

4. Check the current branch:
   // turbo

```bash
git branch --show-current
```

5. Review recent commits:
   // turbo

```bash
git log --oneline -10
```

6. Summarize:
   - Current phase
   - Completed tasks (✅)
   - Current/next task (⬜)
   - Any blockers or dependencies
   - Recommended next action
