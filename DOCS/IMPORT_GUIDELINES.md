# Import Path Guidelines - Convergence Project

## ⚠️ CRITICAL: Always Use Relative Paths

**Problem**: Using `src/` prefix imports (e.g., `import { cn } from "src/lib/utils"`) **WILL BREAK** Vite production builds even if they work in development.

**Solution**: Always use relative paths (e.g., `import { cn } from "../../lib/utils"`).

---

## Import Path Reference by Location

### From `/src/components/ui/` (UI Component Files)

```typescript
// ✅ CORRECT - Relative to utilities
import { cn } from "../../lib/utils"

// ❌ BREAKS BUILD
import { cn } from "src/lib/utils"
```

### From `/src/components/` (Root component directory)

```typescript
// ✅ CORRECT - Import UI components
import { Button } from "./ui/button"
import { Card } from "./ui/card"

// ❌ BREAKS BUILD
import { Button } from "src/components/ui/button"
```

### From `/src/components/[feature]/` (Feature-specific components)

**Example: `/src/components/history/BlueprintCard.tsx`**

```typescript
// ✅ CORRECT - Up one level to reach ui/ folder
import { Card } from "../ui/card"
import { Button } from "../ui/button"

// ✅ CORRECT - Same folder
import { formatDate } from "./utils"

// ❌ BREAKS BUILD
import { Card } from "src/components/ui/card"
```

### From `/src/pages/` (Page Components)

**Example: `/src/pages/History.tsx`**

```typescript
// ✅ CORRECT
import { supabase } from "../lib/supabase"
import { Button } from "../components/ui/button"
import { BlueprintCard } from "../components/history/BlueprintCard"
import type { Blueprint } from "../types/blueprint"

// ❌ BREAKS BUILD
import { supabase } from "src/lib/supabase"
import { Button } from "src/components/ui/button"
```

---

## Quick Reference Chart

| From Location | To Import | Correct Path | ❌ Wrong Path |
|---------------|-----------|--------------|--------------|
| `/src/components/ui/` | `/src/lib/utils` | `../../lib/utils` | `src/lib/utils` |
| `/src/components/` | `/src/components/ui/button` | `./ui/button` | `src/components/ui/button` |
| `/src/components/history/` | `/src/components/ui/card` | `../ui/card` | `src/components/ui/card` |
| `/src/pages/` | `/src/lib/supabase` | `../lib/supabase` | `src/lib/supabase` |
| `/src/pages/` | `/src/components/ui/button` | `../components/ui/button` | `src/components/ui/button` |

---

## Why This Matters

### Development vs Production

- **Development (`npm run dev`)**: May work with `src/` imports due to Vite's dev server resolution
- **Production (`npm run build`)**: Rollup (Vite's bundler) **FAILS** with errors like:
  ```
  Rollup failed to resolve import "src/lib/utils"
  ```

### The Root Cause

Vite's production build uses Rollup, which doesn't recognize `src/` as a module path. It expects either:
1. Relative paths (e.g., `../../lib/utils`)
2. Node modules (e.g., `lucide-react`)
3. Configured aliases (e.g., `@/` - which we deliberately avoid for SSR compatibility)

---

## Fixing Existing Files

### Search for problematic imports:
```bash
grep -r 'from "src/' src/
```

### Common fixes:

**In `/src/components/ui/*.tsx`:**
```diff
- import { cn } from "src/lib/utils"
+ import { cn } from "../../lib/utils"
```

**In pattern files (`/src/components/pattern-*.tsx`):**
```diff
- import { Button } from "src/components/ui/button"
+ import { Button } from "./ui/button"
```

**In page files (`/src/pages/*.tsx`):**
```diff
- import { supabase } from "src/lib/supabase"
+ import { supabase } from "../lib/supabase"
```

---

## When Installing New Components

### Shadcn Components
When running `npx shadcn@latest add [component]`, the CLI may generate files with `src/` imports (especially from external registries like KiboUI).

**Always verify and fix immediately:**
```bash
# After installing a component
npm run build:client
```

If build fails with import errors, fix them before proceeding.

### KiboUI Pattern Files
Patterns from `@my-patterns` registry often come with `src/` imports. Fix them immediately:

```bash
# Example: After installing pattern-button-standard-5
# Check the file: src/components/pattern-button-standard-5.tsx
# Fix any src/ imports to relative paths
```

---

## Verification Checklist

Before committing new components:

- [ ] Run `npm run build:client` successfully
- [ ] No `from "src/` in any new files
- [ ] All imports use relative paths
- [ ] TypeScript shows no errors

---

## Exception: External Dependencies

**DO use direct imports** for:
- ✅ Node modules: `import { Button } from "lucide-react"`
- ✅ Radix UI: `import * as DialogPrimitive from "@radix-ui/react-dialog"`
- ✅ React: `import React, { useState } from 'react'`

**NEVER use `src/` for internal files.**

---

## Project Rules Summary

1. **Use relative paths for all internal imports**
2. **Never use `src/` prefix**
3. **Avoid path aliases like `@/`** (SSR incompatible)
4. **Always test production builds** after adding components
5. **Fix KiboUI pattern imports immediately** after installation

---

**Last Updated**: 2025-10-22  
**Build System**: Vite 7.x + Rollup  
**Project**: Convergence (Fastify/React)
