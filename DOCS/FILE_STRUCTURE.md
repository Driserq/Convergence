# File Structure - Convergence Habit Blueprint MVP

## Overview
This document describes the current file structure after implementing Vite-based client bundling with Fastify server.

## Architecture Summary
- **Frontend**: React SPA bundled with Vite (located in `dist/client/`)
- **Backend**: Fastify server compiled from TypeScript (located in `dist/`)
- **Development**: Concurrent build/watch with separate client and server processes
- **Routing**: Client-side SPA routing using custom RouterContext

---

## Root Directory

```
convergence/
├── .env.local              # Local environment variables (NOT in git)
├── .env.production         # Production environment variables (NOT in git)
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config for client
├── tsconfig.server.json    # TypeScript config for server (excludes React)
├── vite.config.ts          # Vite bundler configuration
├── postcss.config.mjs      # PostCSS with TailwindCSS v4 plugin
├── tailwind.config.ts      # TailwindCSS configuration
├── index.html              # Vite entry point (loads main.tsx)
├── supabase/               # Supabase local development files
├── src/                    # Source code (see below)
├── dist/                   # Build output (NOT in git)
│   ├── client/             # Vite-built React app
│   │   ├── index.html      # Client entry HTML
│   │   └── assets/         # Bundled JS/CSS
│   ├── server.js           # Compiled Fastify server
│   ├── routes/             # Compiled API routes
│   └── lib/                # Compiled utilities
├── DOCS/                   # Documentation
└── design-docs/            # UI/UX design specs
```

---

## Source Code Structure (`src/`)

### Entry Points

#### `src/main.tsx` - Client Entry Point
- **Purpose**: React app entry point, loaded by Vite
- **Responsibilities**:
  - Injects Vite environment variables into `window` for client-side access
  - Renders the root `<App />` component
  - Initializes React DOM
- **Environment**: Client-side only
- **Used by**: `index.html` via Vite

#### `src/server.ts` - Server Entry Point
- **Purpose**: Fastify server initialization
- **Responsibilities**:
  - Starts Fastify HTTP server
  - Registers API routes (`/api/*`)
  - Serves static Vite-built client from `dist/client/`
  - Handles server-side environment variables
- **Environment**: Server-side only (Node.js)
- **Used by**: `npm run dev`, `npm start`

---

### Core Application Files

#### `src/App.tsx` - Main React Application
- **Purpose**: Root component managing routing and layout
- **Key Features**:
  - Client-side SPA routing (no external router library)
  - Authentication state management via `useAuth`
  - Route protection (redirects unauthenticated users)
  - Conditional Navigation bar rendering
- **Routes**:
  - `/` → Landing (public)
  - `/login` → Login (public)
  - `/dashboard` → Dashboard (protected)
  - `/history` → History (protected)
  - `/profile` → Profile (protected)
  - `/blueprints/:id` → Blueprint Detail (protected)
- **Provides**: RouterContext to entire app

---

### Contexts (`src/contexts/`)

#### `src/contexts/RouterContext.tsx`
- **Purpose**: Provides client-side navigation without page reloads
- **Exports**:
  - `RouterProvider` - Context provider wrapping the app
  - `useRouter()` - Hook to access `navigate(path)` function
- **Used by**: App.tsx, Navigation.tsx, Landing.tsx, other pages
- **Why**: Enables SPA navigation so clicking links updates URL without full page reload

---

### Pages (`src/pages/`)

#### `src/pages/Landing.tsx`
- **Purpose**: Landing page for unauthenticated users
- **Features**:
  - Hero section with CTA buttons
  - Pain points, outcomes, and product explanations
  - FAQ accordion
  - Footer
- **Styling**: Dark theme (gray-900 background, white text)
- **Uses**: `useRouter` for navigation to `/login`

#### `src/pages/Login.tsx`
- **Purpose**: Login/signup page
- **Features**: LoginForm component for authentication
- **Redirects**: To `/dashboard` after successful login

#### `src/pages/Dashboard.tsx`
- **Purpose**: Main authenticated page
- **Features**:
  - Welcome section
  - Blueprint creation form
  - Stats cards (placeholders)
  - Analytics cards
  - Help section
- **Protected**: Requires authentication

#### `src/pages/History.tsx`
- **Purpose**: List of user's saved blueprints
- **Status**: Placeholder (Phase 5)

#### `src/pages/Profile.tsx`
- **Purpose**: User profile and settings
- **Status**: Placeholder (Phase 10)

#### `src/pages/BlueprintDetail.tsx`
- **Purpose**: Individual blueprint view with full details
- **Status**: Placeholder (Phase 5)

#### `src/pages/NotFound.tsx`
- **Purpose**: 404 error page for invalid routes

---

### Components (`src/components/`)

#### `src/components/ui/Navigation.tsx`
- **Purpose**: Top navigation bar for authenticated pages
- **Features**:
  - Logo/brand (links to Dashboard)
  - Main nav links (Dashboard, History)
  - User dropdown menu (Profile, Log out)
  - Avatar with user initials
  - Responsive mobile menu
- **Uses**: `useRouter` for SPA navigation
- **Styling**: Dark theme (gray-800 bg, sticky header)
- **Shows on**: All protected pages (not on Landing/Login)

#### `src/components/ui/` (Shadcn Components)
- **Purpose**: Reusable UI primitives from Shadcn UI
- **Files**:
  - `button.tsx` - Button component
  - `badge.tsx` - Badge component
  - `card.tsx` - Card component with header/content
  - `separator.tsx` - Horizontal divider
  - `alert.tsx` - Alert/notification component
  - `accordion.tsx` - Collapsible FAQ component
  - `dropdown-menu.tsx` - Dropdown menu for user menu
  - `avatar.tsx` - User avatar component
- **Installation**: Via shadcn CLI (`npx shadcn add <component>`)
- **Styling**: Dark theme overrides in component files

---

### Hooks (`src/hooks/`)

#### `src/hooks/useAuth.ts`
- **Purpose**: Authentication state management
- **Features**:
  - `initialize()` - Set up auth listener (called once in App.tsx)
  - `user` - Current authenticated user
  - `loading` - Auth loading state
  - `login(email, password)` - Sign in
  - `signup(email, password)` - Sign up
  - `logout()` - Sign out
- **Used by**: App.tsx, Navigation.tsx, LoginForm.tsx
- **State**: Uses Zustand for global state

---

### Library Files (`src/lib/`)

#### `src/lib/supabase.ts` - Client-Side Supabase
- **Purpose**: Supabase client for browser (React components/hooks)
- **Environment**: Uses `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY` (injected by Vite)
- **Features**:
  - Session persistence enabled
  - Auto token refresh
  - Warns if environment variables missing
- **Used by**: useAuth.ts, client-side components

#### `src/lib/supabase.server.ts` - Server-Side Supabase
- **Purpose**: Supabase client for Node.js server (API routes)
- **Environment**: Uses `process.env.SUPABASE_URL` and `process.env.SUPABASE_ANON_KEY`
- **Features**:
  - No session persistence (server doesn't need it)
  - No auto refresh
- **Used by**: Server-side API routes (blueprint.ts)

#### `src/lib/database.ts`
- **Purpose**: Database helper functions
- **Features**:
  - `getServiceClient()` - Creates service role client (bypasses RLS)
  - `saveBlueprintToDatabase()` - Saves blueprint with user context
- **Used by**: API routes for database operations

#### `src/lib/gemini.ts`
- **Purpose**: Google Gemini AI client setup
- **Status**: Placeholder (Phase 4)

#### `src/lib/transcript.ts`
- **Purpose**: YouTube transcript extraction via Supadata API
- **Features**:
  - Handles both sync (200) and async (202) responses
  - Polls for job completion
  - Error handling and retries
- **Used by**: API routes for YouTube content

#### `src/lib/utils.ts`
- **Purpose**: General utility functions (e.g., `cn()` for className merging)

---

### Routes (`src/routes/`)

#### `src/routes/blueprint.ts`
- **Purpose**: API endpoints for blueprints
- **Endpoints**:
  - `GET /api/blueprints` - Fetch user's blueprints
  - `POST /api/create-blueprint` - Create new blueprint from YouTube/text
- **Features**:
  - Authentication via JWT token in Authorization header
  - YouTube transcript extraction
  - Gemini AI blueprint generation
  - Database persistence
- **Uses**: supabase.server.ts, database.ts, transcript.ts

---

### Types (`src/types/`)

#### `src/types/blueprint.ts`
- **Purpose**: TypeScript types for blueprints
- **Exports**: BlueprintFormData, ContentType, AIBlueprint, etc.

#### `src/types/user.ts`
- **Purpose**: TypeScript types for users
- **Status**: Placeholder

---

### Styles (`src/styles/`)

#### `src/styles/globals.css`
- **Purpose**: Global CSS and TailwindCSS imports
- **Content**:
  ```css
  @import "tailwindcss";
  ```
- **TailwindCSS v4**: Uses new single import syntax

---

## Configuration Files

### `tsconfig.json` - Client TypeScript Config
- **Purpose**: TypeScript configuration for React client code
- **Includes**: All `src/**/*` files
- **Target**: ES2022, JSX react-jsx, DOM lib
- **Paths**: `@/*` alias for `src/*`

### `tsconfig.server.json` - Server TypeScript Config
- **Purpose**: TypeScript configuration for Node.js server code
- **Extends**: `tsconfig.json`
- **Includes**: Only server files (server.ts, routes/, lib/server files)
- **Excludes**: All React/client files (components/, pages/, hooks/, contexts/)
- **Target**: ES2022, NO DOM lib
- **Strict**: Disabled for MVP speed (type assertions used)

### `vite.config.ts` - Vite Bundler Config
- **Purpose**: Configure Vite for React SPA bundling
- **Features**:
  - React plugin for JSX/TSX
  - Path aliases (`@/` → `src/`)
  - Build output to `dist/client/`
  - Dev proxy for `/api/*` requests to Fastify server

### `postcss.config.mjs` - PostCSS Config
- **Purpose**: Configure PostCSS for TailwindCSS v4
- **Plugin**: `@tailwindcss/postcss`

### `package.json` - Scripts
```json
{
  "scripts": {
    "dev": "npm run build:client && tsx watch src/server.ts",
    "dev:client": "vite",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc --project tsconfig.server.json",
    "start": "cross-env NODE_ENV=production node dist/server.js"
  }
}
```

---

## Build Process

### Development (`npm run dev`)
1. **Build client**: `vite build` → `dist/client/`
2. **Watch server**: `tsx watch src/server.ts` (recompiles on changes)
3. Server serves static client from `dist/client/`
4. Server runs API routes on `/api/*`

### Production (`npm run build` → `npm start`)
1. **Build client**: `vite build` → `dist/client/`
2. **Build server**: `tsc --project tsconfig.server.json` → `dist/`
3. **Start**: `node dist/server.js`
4. Server serves static client and API routes

---

## Key Decisions & Patterns

### Client-Side Routing
- **No external router**: Custom routing in App.tsx using `window.location.pathname` and `window.history.pushState`
- **RouterContext**: Provides `navigate()` function to entire app
- **Why**: Keeps bundle size small, full control over routing logic

### Supabase Split
- **Client**: `supabase.ts` uses `window` env vars for browser
- **Server**: `supabase.server.ts` uses `process.env` for Node.js
- **Why**: Browser can't access `process.env`, server can't access `window`

### TypeScript Config Split
- **Client**: Includes React code, DOM types
- **Server**: Excludes React code, no DOM types, relaxed strictness
- **Why**: Prevents server build from trying to compile React code with browser globals

### Dark Theme
- **Temporary**: Gray-900/800 backgrounds, white text
- **Reason**: Placeholder until brand colors decided
- **Applied**: Landing, Dashboard, Navigation, Shadcn components

---

## Environment Variables

### Client (Browser)
- Accessed via `window.SUPABASE_URL`, `window.SUPABASE_ANON_KEY`
- Injected by `main.tsx` from Vite's `import.meta.env.VITE_*`
- **Must have `VITE_` prefix** in `.env` file

### Server (Node.js)
- Accessed via `process.env.*`
- Loaded from `.env` by server startup
- **No `VITE_` prefix needed**

### Required Variables
```env
# .env.local (development)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_AI_API_KEY=your_gemini_key
SUPADATA_API_KEY=your_supadata_key
```

---

## Next Steps (Roadmap)

### Phase 2: Authentication Flow
- ✅ Login page with LoginForm
- ✅ useAuth hook
- ✅ Protected routes
- TODO: Signup flow, password reset

### Phase 3: Navigation
- ✅ Navigation bar component
- ✅ User dropdown menu
- ✅ Client-side routing
- TODO: Active route highlighting

### Phase 4: Blueprint Form
- TODO: Form validation
- TODO: YouTube URL validation
- TODO: Text input support

### Phase 5: Blueprint Display
- TODO: History page with blueprint list
- TODO: Blueprint detail page
- TODO: Overview + habits sections

### Phase 9: Dashboard
- ✅ Welcome section
- ✅ Placeholder stats cards
- ✅ Help section
- TODO: Wire up real stats

---

## Common Tasks

### Add New Page
1. Create `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx` `renderPage()` function
3. Import page component at top of `App.tsx`
4. Add navigation link in `Navigation.tsx` (if needed)

### Add New API Route
1. Create `src/routes/newroute.ts`
2. Export `default async function(fastify: FastifyInstance)`
3. Register in `src/server.ts`
4. Add to `tsconfig.server.json` includes

### Add New Shadcn Component
1. Run `npx shadcn add <component-name>`
2. Component appears in `src/components/ui/`
3. Import and use in your pages/components

### Add New Hook
1. Create `src/hooks/useNewHook.ts`
2. Use Zustand for global state if needed
3. Import and use in components

### Update Styles
1. Modify `src/styles/globals.css` for global changes
2. Use Tailwind classes inline for component-specific styles
3. Dark theme: `bg-gray-900`, `text-white`, etc.

---

**Last Updated**: 2025-10-22 (After Vite + SPA routing implementation)
