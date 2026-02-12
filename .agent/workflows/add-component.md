---
description: Add a new Shadcn/ui component to the project
---

# Add Shadcn Component Workflow

1. Add the component:

```bash
cd apps/web && npx shadcn@latest add <component-name>
```

2. Verify:
   // turbo

```bash
ls apps/web/components/ui/
```

3. Import with `@/components/ui/<component>` path.
