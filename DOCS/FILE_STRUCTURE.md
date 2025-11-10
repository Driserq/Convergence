# File Structure - Convergence Habit Blueprint MVP

## Overview
This document reflects the repository structure and runtime flow as of **2025-11-09**. The project runs a Fastify server that serves a Vite-built React SPA alongside API routes for AI blueprint generation.

## Architecture Summary
- **Frontend**: React 19 SPA bundled by Vite 7 → output in `dist/client`
- **Backend**: Fastify 5 TypeScript server (`src/server.ts`) serving static assets and registering API routes
- **Runtime**: Client-side routing managed manually in `App.tsx` (no React Router)
- **State**: Zustand for auth/session state, React Hook Form + Zod for forms (in progress)
- **Styling**: TailwindCSS v4 utilities + shadcn/ui primitives

---

## Root Directory

```
Convergence/
├── .env*                 # Local environment files (never committed)
├── .gitignore
├── components.json       # shadcn/ui registry config
├── design-docs/          # UI/UX references
├── dist/                 # Build output (client + compiled server)
│   ├── client/           # Vite output served in production
│   ├── server.js         # Transpiled Fastify server entry
│   ├── routes/           # Transpiled API routes
│   └── lib/              # Transpiled server utilities
├── DOCS/                 # Internal documentation (this file, plan, etc.)
├── index.html            # Vite HTML entry
├── node_modules/
├── package.json / package-lock.json
├── Patterns-Registry/    # Local pattern inventory from registries
├── postcss.config.js     # Tailwind v4 PostCSS hook
├── src/                  # Application source code (see below)
├── SUPADATA_DEBUG.md     # Notes for transcript debugging
├── tailwind.config.js
├── tsconfig.json         # Client TS config (`strict: true`, `@` alias)
├── tsconfig.server.json  # Server TS config (relaxed strictness)
├── vite.config.ts        # Vite + dev proxy configuration
└── WARP.md               # Project rules + overview
```

> **Note**: A `.supabase` directory is *not* committed. Run `npx supabase start` locally to provision the development stack when needed.

---

## Build Outputs (`dist/`)
- `dist/client/`: Static assets produced by `vite build`. Served by Fastify in production and during `npm run dev` after the pre-build step.
- `dist/server.js`: Compiled version of `src/server.ts` generated via `tsc --project tsconfig.server.json`.
- `dist/routes/`, `dist/lib/`: Transpiled API routes and server utilities used by the production server entry.

---

## Source Code Overview (`src/`)

### Entry Points
- `main.tsx`: Hydrates the React app, injects `VITE_*` env vars into `window`, and mounts `<App />`.
- `App.tsx`: SPA shell providing custom routing (`navigate()` via context), authentication gating, and global layout decisions. Shared routing helpers and the provider live alongside it in `src/contexts/RouterContext.tsx`.
- `server.ts`: Fastify bootstrap that loads env vars, registers plugins (CORS, env schema, static serving), mounts API routes, and serves the SPA fallback.

### Key Directories
- `components/`: UI building blocks. Includes shadcn primitives under `ui/` and feature modules (e.g., `blueprint/BlueprintForm.tsx`). Recent shadcn imports have been converted to relative paths per import policy.
- `pages/`: Page-level components rendered by the custom router (Landing, Login, Dashboard, History, Profile, BlueprintDetail, NotFound). Landing and Dashboard currently exceed the 200-line target and are earmarked for future decomposition.
- `hooks/`: Custom hooks such as `useAuth.ts`, which wraps Supabase auth via Zustand.
- `contexts/`: React context providers (e.g., `RouterContext.tsx`).
- `lib/`: Shared utilities split between client and server concerns (`supabase.ts`, `supabase.server.ts`, `transcript.ts`, `gemini.ts` placeholder, `utils.ts`).
- `routes/`: Fastify route registrations (`blueprint.ts`, `transcript.ts`). These are TypeScript during development but compiled to `.js` in `dist/` for production. Awareness: `server.ts` dynamically imports `./routes/blueprint.js`, so the build step must run before production starts.
- `styles/`: Tailwind v4 global stylesheet (`globals.css`).
- `types/`: Centralized TypeScript types (`blueprint.ts`, `user.ts` placeholder, etc.).

### Notable Implementation Details
- The SPA navigation intercepts anchor clicks to keep client-side routing without React Router.
- API routes assume Supabase JWT auth headers and delegate to Supabase for data access (RLS-aware).
- `BlueprintForm.tsx` already wires up React Hook Form controls but still requires validation + submission integration in upcoming phases.

---

## Supporting Directories & Files
- `Patterns-Registry/`: Snapshot of imported patterns (KiboUI/shadcn). These files often ship with `src/` imports; run through the import checklist before using any pattern.
- `design-docs/`: UX notes, wireframes, and design explorations.
- `DOCS/`: Project documentation (tech stack, schema, import policy, plan, etc.).
- `server.log`: Local Fastify log output for debugging.

---

## Tooling & Configuration Highlights

### TypeScript
- `tsconfig.json`: `strict: true` for client code, includes `@/*` path alias (policy still prefers relative imports; see Import Guidelines).
- `tsconfig.server.json`: Extends client config but relaxes strictness and excludes React-specific directories. Used by `npm run build:server`.

### Vite (`vite.config.ts`)
- React plugin enabled.
- Alias `@` → `./src` (available but intentionally unused in commits).
- Production output routed to `dist/client`.
- Dev server proxy routes `/api` and `/health` to Fastify at `http://localhost:3001`.
- `server.host` set to `localhost`, dev port `5173`.

### Package Scripts (excerpt)
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

- `npm run dev` performs a one-time client build before launching the server watcher so the SPA assets exist for Fastify.
- Use `npm run dev:client` when iterating purely on UI with hot module reload (proxy keeps API calls functional).

### Tailwind & PostCSS
- `tailwind.config.js`: Tailwind v4 config (utility-first with dark theme defaults).
- `postcss.config.js`: Loads `@tailwindcss/postcss` plugin for Vite builds.

---

## Build & Runtime Workflow

### Development (`npm run dev`)
1. Vite builds client assets into `dist/client`.
2. `tsx watch src/server.ts` recompiles the Fastify server on change.
3. Fastify serves static assets from `dist/client` and proxies API routes on `/api/*`.

### Production (`npm run build` → `npm start`)
1. `vite build` creates optimized client bundle in `dist/client`.
2. `tsc` compiles server and route files into `dist/`.
3. `node dist/server.js` launches Fastify with static file serving + API routes.

---

## Environment Variables

### Client (`VITE_*`)
- Injected at build time, surfaced globally by `main.tsx` on `window`.
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Server
- Loaded via `dotenv` in `src/server.ts`, validated by `@fastify/env`.
- Required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_AI_API_KEY` (Supadata + optional `SUPADATA_API_KEY`).
- `.env`, `.env.local`, `.env.production` remain local secrets.

### Sample Development Entries
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<anon-key>
GOOGLE_AI_API_KEY=<gemini-key>
SUPADATA_API_KEY=<supadata-key>
```

---

## Current Implementation Status (Nov 2025)
- **Authentication flow** (Phase 2): Login, logout, and protected routes operational; signup/password reset still pending.
- **Navigation shell** (Phase 3): Navigation bar + custom router in place; active state styling TODO.
- **Blueprint form** (Phase 3/4): `BlueprintForm.tsx` scaffolded with React Hook Form controls; validation + submit wiring in progress.
- **Dashboard UI** (Phase 9 preview): Cards and placeholder analytics rendered with static data.
- **API integration** (Phases 4-5): `routes/blueprint.ts` contains transcript + Gemini pipeline scaffolding; final Gemini client implementation pending.
- **History/Profile pages**: Present but populated with placeholder content awaiting Supabase integration.

---

## Common Contributor Tasks
- **Add a page**: Create `src/pages/NewPage.tsx`, import in `App.tsx`, update route switch, and (optionally) add navigation links.
- **Add a shadcn component**: `npx shadcn add <component>` → fix generated imports to be relative and run `npm run build:client`.
- **Add a Fastify route**: Implement `src/routes/new-route.ts`, include it in `server.ts`, and ensure it’s listed in `tsconfig.server.json`.
- **Refine large components**: When touching Landing or Dashboard, break sections into smaller components under `src/components/` to respect line targets.

---

**Last Updated**: 2025-11-09
