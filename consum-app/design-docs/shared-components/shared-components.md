# Shared Components

Components that appear across multiple pages in this project.

## Navigation

### `src/components/ui/Navigation.tsx` (Created 2025-10-22)
**Purpose**: Top navigation bar for authenticated pages

**Features**:
- Logo/brand ("Consum") - links to Dashboard
- Main navigation links: Dashboard, History
- User dropdown menu with:
  - User email display
  - Profile link
  - Dashboard link
  - History link  
  - Log out button (red accent)
- User avatar with initials
- Responsive mobile menu

**Styling**:
- Dark theme: `bg-gray-800` with `border-gray-700`
- Sticky header: `sticky top-0 z-50`
- White text with hover effects

**Navigation Method**:
- Uses `useRouter()` from `src/contexts/RouterContext.tsx`
- Client-side SPA navigation (no page reloads)

**Used On**: 
- Dashboard ✅
- History ✅
- Profile ✅
- Blueprint Detail ✅
- Feedback ✅ (new nav entry pointing to `/feedback`)
- **NOT** on Landing or Login (public pages)

**Dependencies**:
- `useAuth()` - Gets current user and logout function
- `useRouter()` - For SPA navigation
- Avatar component (Shadcn)
- Dropdown Menu component (Shadcn)
- Button component (Shadcn)

## Authentication

### `src/components/auth/GoogleAuthButton.tsx` (Created 2025-11-30)
**Purpose**: Shared OAuth trigger used on Login and Sign Up pages for "Continue with Google" actions.

**Features**:
- Wraps the `button → secondary` Kibo styling with Google branding (icon/text).
- Handles Supabase `auth.signInWithOAuth({ provider: 'google' })` call with redirect `https://consum.app/login`.
- Exposes `onError` callback so parent forms can surface failures inside existing alert components.
- Disables itself while Supabase initializes to prevent duplicate submissions.

**Styling**:
- `variant="outline"` button with subtle border + Google logomark circle.
- Full-width layout for parity with credential CTA.

**Used On**:
- Login form (beneath credential inputs)
- Sign Up form (beneath credential inputs)

**Dependencies**:
- `useAuth()` – Access to shared `signInWithGoogle` method
- `lucide-react` Loader2 icon for pending state

## UI Primitives (Shadcn Components)

All located in `/src/components/ui/` - reusable across all 6 pages

### Core Components (Installed 2025-10-21/22)
1. **button.tsx** - Primary CTAs, various variants (default, destructive, outline, secondary, ghost, link)
   - Used on: Landing, Dashboard, History, Blueprint Detail, Profile, Login
   
2. **badge.tsx** - Status labels and indicators (default, secondary, destructive, outline)
   - Used on: Landing (bullets + numbers), Dashboard, History, Blueprint Detail
   
3. **card.tsx** - Content containers with Header, Title, Description, Content, Footer
   - Used on: Landing (pain/outcome cards), Dashboard, History, Blueprint Detail
   
4. **separator.tsx** - Horizontal/vertical dividers
   - Used on: Landing, Dashboard, Profile
   
5. **alert.tsx** - Info/warning/error messages with Title and Description
   - Used on: Landing (founder message), Dashboard, Blueprint Detail
   
6. **accordion.tsx** - Collapsible sections (Root, Item, Trigger, Content)
   - Used on: Landing (FAQ), potentially Dashboard

7. **dropdown-menu.tsx** - Dropdown menus (Root, Trigger, Content, Item, Label, Separator)
   - Installed: 2025-10-22
   - Used on: Navigation (user menu), potentially other pages

8. **avatar.tsx** - User avatar with image fallback and initials (Root, Image, Fallback)
   - Installed: 2025-10-22
   - Used on: Navigation (user menu), Profile, potentially comments/reviews

### Technical Notes
- **CRITICAL**: All imports MUST use relative paths (e.g., `../../lib/utils`, `./ui/button`)
- **NEVER** use `src/` prefix imports (e.g., `src/lib/utils` or `src/components/ui/button`) - these break Vite builds
- SSR-friendly (no "use client" directives unless required by Radix UI)
- Compatible with Fastify/React (not Next.js specific)
- Styled with Tailwind CSS + CVA (class-variance-authority)

### Import Path Reference
**From `/src/components/ui/` to utilities:**
```typescript
import { cn } from "../../lib/utils"  // ✅ CORRECT
import { cn } from "src/lib/utils"     // ❌ BREAKS BUILD
```

**From `/src/components/` to UI components:**
```typescript
import { Button } from "./ui/button"           // ✅ CORRECT
import { Button } from "src/components/ui/button" // ❌ BREAKS BUILD
```

**From `/src/pages/` or `/src/components/[feature]/` to UI components:**
```typescript
import { Button } from "../components/ui/button"  // ✅ CORRECT
import { Card } from "../ui/card"                 // ✅ CORRECT (from feature dir)
```

### Future Components (To be added)
- form/input - For Login, Dashboard blueprint creation
- table/data-table - For History page
- dialog/sheet - For modals and side panels
- tabs - For switching between different views
- toast - For notifications
- And others as needed per page

---

## Component Organization

### `/src/components/ui/` - Shadcn UI Primitives
**Purpose**: Reusable, unstyled UI primitives installed via Shadcn CLI

**Installation**: `npx shadcn add <component-name>`

**Current Components**:
- accordion.tsx
- alert.tsx
- avatar.tsx
- badge.tsx
- button.tsx
- card.tsx
- dropdown-menu.tsx
- separator.tsx
- Navigation.tsx (custom, not from Shadcn)

**Styling Approach**:
- Base styles from Shadcn with CVA variants
- Dark theme overrides applied inline
- Tailwind CSS classes

### `/src/contexts/` - React Contexts
**Purpose**: Global state and functionality providers

**Current Contexts**:
- `RouterContext.tsx` - Provides `navigate()` function for SPA routing

### `/src/hooks/` - Custom React Hooks  
**Purpose**: Reusable stateful logic

**Current Hooks**:
- `useAuth.ts` - Authentication state (user, login, logout, signup)
- Used by: Navigation, Login, App, protected pages

---

## Shared Patterns

### Dark Theme (Temporary)
Applied consistently across all components:
- Background: `bg-gray-900` (main), `bg-gray-800` (cards/header)
- Text: `text-white`, `text-gray-300` (secondary)
- Borders: `border-gray-700`
- Hover: `hover:bg-gray-700`

### SPA Navigation Pattern
All navigation links use the router context:
```typescript
import { useRouter } from '@/contexts/RouterContext'

const { navigate } = useRouter()
navigate('/dashboard') // No page reload
```

**Do NOT use**:
- `<a href>` tags for internal navigation
- `window.location.href = '/path'`

These cause full page reloads.

### Authentication Pattern
Protected components check auth state:
```typescript
import { useAuth } from '@/hooks/useAuth'

const { user, loading } = useAuth()

if (!user) {
  // Redirect to login or show login prompt
}
```

---

## Page-Specific vs Shared

### Shared Across Multiple Pages
- Navigation component (all authenticated pages)
- All Shadcn UI primitives (buttons, cards, badges, etc.)
- useAuth hook (authentication)
- useRouter hook (navigation)

### Page-Specific Components
- LoginForm (only Login page)
- BlueprintForm (only Dashboard)
- BlueprintList (only History)
- (More to be added as pages are built)

---

**Last Updated**: 2025-10-22 (After Navigation implementation)
