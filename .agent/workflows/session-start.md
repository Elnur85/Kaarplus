---
title: Session Start Workflow
description: Mandatory steps to follow at the start of every development session.
triggers:
  - "Start session"
  - "Begin work"
  - "New task"
---

# Session Start Workflow

**Follow these steps at the start of EVERY session before writing any code.**

---

## Step 1: Read Ground Rules

Read `docs/GROUND_RULES.md` in full.

This contains:
- Project identity and tech stack
- Non-negotiable rules
- Before-you-code checklist
- Session start protocol (you're reading it now)

**Do not skip this step.** The rules change as the project evolves.

---

## Step 2: Read Architecture

Read `docs/ARCHITECTURE.md` in full.

This ensures you understand:
- System layout and data flow
- Frontend architecture (Server vs Client Components)
- Backend architecture (middleware pipeline)
- Where your changes will fit

---

## Step 3: Read Relevant API Documentation

Read the section of `docs/API.md` relevant to your task.

- Working on listings? → Read "Listings" section
- Working on auth? → Read "Auth" section
- Working on admin? → Read "Admin" section

This prevents:
- Duplicating existing endpoints
- Using wrong HTTP methods
- Missing required parameters

---

## Step 4: Read Relevant Rules

Read `.agent/rules/` files relevant to your task:

| Task Type | Read These Rules |
|-----------|------------------|
| Frontend UI | `frontend-rules.md`, `coding-standards.md` |
| Frontend components | `frontend-rules.md` |
| API/backend | `backend-rules.md`, `security-rules.md` |
| Database changes | `architecture-guidelines.md` |
| Authentication | `security-rules.md` |
| Any code | `coding-standards.md`, `error-handling.md` |

---

## Step 5: Check Existing Code

Before creating anything new, check if it already exists:

### Frontend Components
```bash
ls apps/web/src/components/shared/     # Reusable components
ls apps/web/src/components/ui/         # Shadcn/ui primitives
ls apps/web/src/hooks/                 # Custom hooks
ls apps/web/src/stores/                # Zustand stores
ls apps/web/src/lib/                   # Utilities
```

### Backend Utilities
```bash
ls apps/api/src/utils/                 # Utilities
ls apps/api/src/schemas/               # Validation schemas
ls apps/api/src/middleware/            # Middleware
```

### Translation Keys
Check all three language files:
```bash
cat apps/web/messages/et/common.json   # Check for existing keys
cat apps/web/messages/en/common.json
cat apps/web/messages/ru/common.json
```

---

## Step 6: State Your Plan

**Before writing any code, state your plan:**

```
## Plan for [Task ID or Description]

### Files to Modify
1. `apps/api/src/routes/xxx.ts` - Reason
2. `apps/web/src/components/xxx.tsx` - Reason
3. `apps/web/messages/*/xxx.json` - Add translation keys

### Expected Outcome
[What will change from user perspective]

### Verification Steps
1. [How to verify API works]
2. [How to verify UI displays correctly]
3. [How to verify in all 3 languages]
```

Wait for user confirmation before proceeding if:
- The task is large (>10 files)
- You're unsure about the approach
- The plan conflicts with existing patterns

---

## Step 7: Begin Implementation

Now you can start writing code, following all rules and patterns established in the documentation.

### During Implementation

- **Run checks frequently:**
  ```bash
  npm run lint
  npm run typecheck
  ```

- **Test in all three languages:**
  - ET (Estonian) - default
  - EN (English)
  - RU (Russian)

- **Verify all three states:**
  - Loading state
  - Empty state
  - Error state

---

## Quick Reference Checklist

Copy this to your plan:

```markdown
- [ ] Read GROUND_RULES.md
- [ ] Read ARCHITECTURE.md
- [ ] Read relevant API.md section
- [ ] Read relevant .agent/rules/
- [ ] Checked for existing components/utilities
- [ ] Translation keys exist in et/en/ru
- [ ] Plan stated and confirmed
- [ ] Implementation follows coding standards
```

---

## Emergency Shortcut

If you're in the middle of a bug fix and need to skip to relevant docs:

1. Read `docs/GROUND_RULES.md` Section 2 (Non-Negotiable Rules)
2. Read relevant section of `docs/ARCHITECTURE.md`
3. Read `.agent/rules/error-handling.md`
4. Fix the bug
5. **Return to full workflow next session**

---

**This workflow is mandatory. Skipping steps leads to inconsistent code and bugs.**
