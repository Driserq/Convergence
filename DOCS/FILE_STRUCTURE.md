# File Structure - Consum Habit Blueprint MVP

## Overview
This document reflects the repository structure and runtime flow as of **2025-12-05**. The project runs a Fastify server that serves a Vite-built React SPA alongside API routes for AI blueprint generation, subscription management, tracking, analytics, and the new authenticated feedback pipeline (form + email relay).

## Architecture Summary
- **Frontend**: React 19 SPA bundled by Vite 7 → output in `dist/client`; unified blueprint display primitives live in `src/components/blueprint/display`. Routes are code-split via `React.lazy`, and a mobile-first app shell + bottom navigation live in shared layout components.
- **Backend**: Fastify 5 TypeScript server (`src/server.ts`) serving static assets, registering API routes (blueprints, subscriptions, tracking, transcripts, billing, webhook, **feedback**), and running a Gemini retry worker plugin plus in-memory rate limiting.
- **Runtime**: Client-side routing managed manually in `App.tsx` (no React Router); navigation state comes from `RouterContext`, which now drives both desktop nav and the mobile bottom tab bar (Today/Create/History).
- **State**: Zustand for auth/session state, React Hook Form + Zod for forms (in progress)
- **Styling**: TailwindCSS v4 utilities + shadcn/ui primitives
- **Offline/PWA**: `vite-plugin-pwa` registers an auto-updating service worker, runtime caching, and installable manifest; `ServiceWorkerToast` surfaces update prompts in the UI.

---

## Root Directory

```
Consum/
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
├── supabase/             # Database migrations (Gemini queue, tracking, subscriptions, metadata)
├── tailwind.config.js
├── tsconfig.json         # Client TS config (`strict: true`, `@` alias)
├── tsconfig.server.json  # Server TS config (relaxed strictness)
├── vite.config.ts        # Vite + dev proxy configuration (PWA + bundle analyzer hooks)
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
- `main.tsx`: Hydrates the React app, injects `VITE_*` env vars into `window`, polyfills `crypto.randomUUID` for insecure contexts, and mounts `<App />`.
- `App.tsx`: SPA shell providing custom routing (`navigate()` via context), authentication gating, lazy-loaded routes, service worker toast notifications, and layout padding that accounts for the mobile bottom nav. Shared routing helpers and the provider live alongside it in `src/contexts/RouterContext.tsx`.
- `server.ts`: Fastify bootstrap that loads env vars, registers plugins (CORS, env schema, static serving, Gemini retry worker), mounts API routes, and serves the SPA fallback.

### Key Directories
- `components/`: UI building blocks. Includes shadcn primitives under `ui/`, a reusable Radix-powered alert dialog wrapper (`components/ui/alert-dialog.tsx`), consolidated blueprint display variants (`components/blueprint/display/BlueprintDisplay.tsx`), shared flows like the delete confirmation dialog (`components/blueprint/DeleteBlueprintDialog.tsx`), the subscription upgrade dialog (`components/subscription/UpgradeDialog.tsx`), Today view modules in `components/today/`, a shared `layout/AppShell.tsx`, system-level helpers like `components/system/ServiceWorkerToast.tsx`, and the shared Supabase-powered Google OAuth trigger (`components/auth/GoogleAuthButton.tsx`) consumed by both Login and Sign Up forms.
- `pages/`: Page-level components rendered by the custom router (Landing, Login, SignUp, VerifyEmail, Dashboard, History, Profile, CreateBlueprint, BlueprintDetail, **Feedback**, NotFound, BillingSuccess, BillingCancel). Landing and Profile currently exceed the 200-line target and are earmarked for future decomposition. Each page re-exports the corresponding view implementation when applicable (`pages/Dashboard.tsx` → `TodayView`, etc.). `SignUp` now owns the dedicated email/password + Google OAuth experience, `VerifyEmail` renders the alert-dialog confirmation shell plus the Supabase-backed resend link for post-signup messaging, and `Feedback.tsx` provides the authenticated form with character counter + RHF/Zod validation that POSTs to `/api/feedback`.
- `hooks/`: Custom hooks such as `useAuth.ts` (Supabase auth via Zustand, exposing `signInWithGoogle`, `resendVerificationEmail`, redirect intent handling, and verified-email gating), `useTrackedBlueprints.ts` (tracked blueprint metadata/completions with optimistic updates), `useSubscription.ts` (subscription state with localStorage cache + Stripe helpers), and `useDashboardStats.ts` (user analytics fetcher).
- `contexts/`: React context providers (e.g., `RouterContext.tsx`).
- `views/`: High-level route experiences (e.g., `TodayView.tsx`, `HistoryView.tsx`, `CreateBlueprintView.tsx`, `BlueprintDetailView.tsx`) that orchestrate Supabase data fetching and compose feature modules.
- `lib/`: Shared utilities split between client and server concerns:
  - `aiClient.ts`: Gemini API caller (honors `GEMINI_FORCE_FAILURE` for testing)
  - `aiErrors.ts`: Error classification helpers shared by the route and worker
  - `blueprintParser.ts`: Sanitizes/repairs Gemini JSON before storing it
  - `database.ts`: Supabase helpers, including the retry queue CRUD helpers plus tracked blueprint/completion mutations and metadata-aware inserts
  - `geminiProcessor.ts`: Background retry loop logic invoked by the worker
  - `blueprint-display.ts`: Normalizes blueprint payloads, extracts overview previews, sanitizes blank entries, and feeds both summary/detail UI variants
  - `stripe.ts`: Stripe client initialization and plan/price helper mapping
  - `subscriptions/`: Plan configuration and subscription services (window renewal, quota enforcement)
  - `tracking.ts`: Identifier helpers, streak computations, and section extractors shared by the Today/History tracking UIs
  - `supabase.ts` / `supabase.server.ts`: Client/server Supabase clients
  - `transcript.ts`: YouTube transcript extraction utilities plus Supadata metadata helpers
  - `email/`: New helpers for transactional email delivery. `email/sendFeedbackEmail.ts` wraps Nodemailer + AWS SES SMTP credentials to relay feedback submissions to `ADMIN_EMAIL`.
  - `auth/requireUser.ts`: Shared Fastify helper that validates Supabase bearer tokens for any protected API route.
  - `rateLimiter.ts`: Simple in-memory sliding window (10 requests / 24h) used by the feedback route.
  - `utils.ts`, etc.: Miscellaneous helpers
- `routes/`: Fastify route registrations (`blueprint.ts`, `subscription.ts`, `tracking.ts`, `transcript.ts`, `billing.ts`, `webhook.ts`, **`feedback.ts`**). Blueprint POST creates a pending record, queues Gemini work, fetches video metadata, and returns `202 Accepted` while the worker finishes processing. Subscription routes expose current usage and plan change endpoints; tracking routes handle toggle/completion mutations for the Today/History UIs with quota enforcement. Billing routes handle Stripe Checkout sessions, and the webhook route processes Stripe events to sync subscription state. The feedback route accepts authenticated POSTs, enforces the in-memory rate limit, and sends AWS SES emails when submissions succeed.
- `styles/`: Tailwind v4 global stylesheet (`globals.css`).
- `types/`: Centralized TypeScript types (`blueprint.ts`, `tracking.ts`, `user.ts` placeholder, etc.).

### Notable Implementation Details
- The SPA navigation intercepts anchor clicks to keep client-side routing without React Router.
- API routes assume Supabase JWT auth headers and delegate to Supabase for data access (RLS-aware).
- `BlueprintForm.tsx` already wires up React Hook Form controls but still requires validation + submission integration in upcoming phases.
- Authenticated sessions remain locked on `VerifyEmail` until Supabase reports `email_confirmed_at`, ensuring unverified accounts cannot access protected screens.

---

## Supporting Directories & Files
- `Patterns-Registry/`: Snapshot of imported patterns (KiboUI/shadcn). These files often ship with `src/` imports; run through the import checklist before using any pattern.
- `design-docs/`: UX notes, wireframes, and design explorations.
- `DOCS/`: Project documentation (tech stack, schema, import policy, plan, production readiness, etc.).
- `server.log`: Local Fastify log output for debugging.
- `supabase/`: SQL migrations. `migrations/202511111200_add_gemini_retry_queue.sql` adds the `habit_blueprints.status` column and the `gemini_retries` queue table with indexes. `migrations/202511131300_add_tracking_tables.sql` seeds `tracked_blueprints` and `blueprint_completions` to persist dashboard/history tracking preferences and completions. `migrations/202511171230_add_user_subscriptions.sql` provisions the `user_subscriptions` table, trigger-managed timestamps, and backfills the free plan baseline for all users. `migrations/202511181200_add_stripe_fields.sql` adds `stripe_customer_id` and `stripe_subscription_id` columns. `migrations/202511201000_add_blueprint_metadata_and_stats.sql` adds `title`/`duration` columns and the `get_user_dashboard_stats` RPC function.

---

## Tooling & Configuration Highlights

### TypeScript
- `tsconfig.json`: `strict: true` for client code, includes `@/*` path alias (policy still prefers relative imports; see Import Guidelines).
- `tsconfig.server.json`: Extends client config but relaxes strictness and excludes React-specific directories. Includes worker-related files (`lib/aiErrors.ts`, `lib/blueprintParser.ts`, `lib/geminiProcessor.ts`, `lib/email/**`, `lib/auth/**`, `lib/rateLimiter.ts`, `plugins/`). Used by `npm run build:server`. **2025-11-29 update**: the server build now targets Node’s native ESM loader with `module`/`moduleResolution` set to `"NodeNext"`; every server-side relative import must include a `.js` suffix (e.g., `import { foo } from '../lib/bar.js'`) so the emitted files resolve correctly at runtime. When adding new server code, follow this convention or the DigitalOcean deploy will fail with `ERR_MODULE_NOT_FOUND`.

### Vite (`vite.config.ts`)
- React plugin enabled.
- Alias `@` → `./src` (available but intentionally unused in commits).
- Production output routed to `dist/client`.
- Dev server proxy routes `/api` and `/health` to Fastify at `http://localhost:3001`.
- `vite-plugin-pwa` registers a service worker + manifest (auto-update, runtime caching, manifest icons placeholder).
- `rollup-plugin-visualizer` can be toggled via `ANALYZE=true` to inspect bundle composition.
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
    "analyze": "ANALYZE=true vite build",
    "start": "cross-env NODE_ENV=production node dist/server.js"
  }
}
```

- `npm run dev` performs a one-time client build before launching the server watcher so the SPA assets exist for Fastify. The Gemini retry worker plugin is registered automatically during this process.
- Use `npm run dev:client` when iterating purely on UI with hot module reload (proxy keeps API calls functional).

### Tailwind & PostCSS
- `tailwind.config.js`: Tailwind v4 config (utility-first with dark theme defaults).
- `postcss.config.js`: Loads `@tailwindcss/postcss` plugin for Vite builds.

---

## Build & Runtime Workflow

### Development (`npm run dev`)
1. Vite builds client assets into `dist/client`.
2. `tsx watch src/server.ts` recompiles the Fastify server on change.
3. Fastify serves static assets from `dist/client`, proxies API routes on `/api/*`, runs the Gemini retry worker interval, and (via the PWA plugin) serves a dev-mode service worker for testing offline flows.

### Production (`npm run build` → `npm start`)
1. `vite build` creates optimized client bundle in `dist/client` (also emits `sw.js`, `manifest.webmanifest`, and bundle visualizer data when `ANALYZE=true`).
2. `tsc` compiles server and route files into `dist/`.
3. `node dist/server.js` launches Fastify with static file serving + API routes.

---

## Environment Variables

### Client (`VITE_*`)
- Injected at build time, surfaced globally by `main.tsx` on `window`.
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Server
- Loaded via `dotenv` in `src/server.ts`, validated by `@fastify/env`.
- Required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_AI_API_KEY`, `SUPADATA_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`, **`ADMIN_EMAIL`, `AWS_SES_SMTP_HOST`, `AWS_SES_SMTP_PORT`, `AWS_SES_SMTP_USER`, `AWS_SES_SMTP_PASS`** (feedback emails), and optional `FEEDBACK_FROM_EMAIL` override.
- `.env`, `.env.local`, `.env.production` remain local secrets.

### Sample Development Entries
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<anon-key>
GOOGLE_AI_API_KEY=<gemini-key>
SUPADATA_API_KEY=<supadata-key>
STRIPE_SECRET_KEY=<stripe-sk>
STRIPE_WEBHOOK_SECRET=<stripe-wh>
STRIPE_PRICE_WEEKLY=<price-id>
STRIPE_PRICE_MONTHLY=<price-id>
FRONTEND_URL=http://localhost:3001
```

---

## Current Implementation Status (Dec 2025)
- **Authentication flow**: Login, logout, and protected routes operational; dedicated Sign Up + Verify Email pages are wired with Supabase email verification and Google OAuth (password reset still pending).
- **Navigation shell**: Custom router powers a sticky desktop header plus a mobile-only bottom tab bar (Today/Dashboard, Create Blueprint, History) backed by a hamburger menu for secondary links; desktop nav now includes a direct Feedback entry that routes to `/feedback`.
- **Blueprint generation**: `BlueprintForm.tsx` submits goals/content, enforces per-plan quotas via `useBlueprint` + `useSubscription`, immediately enqueues Gemini work, and surfaces queued/complete states to the user. New blueprints now automatically fetch and store video metadata (title/duration) from Supadata.
- **Subscription enforcement**: `/api/subscription` exposes plan/usage metadata, `useSubscription` hydrates UI status, `subscriptions/service.ts` renews periods and counts usage, and `subscriptions/plans.ts` centralizes limits.
- **Billing integration**: Stripe test-mode integration via `src/lib/stripe.ts`, `src/routes/billing.ts` (session creation), and `src/routes/webhook.ts` (subscription syncing). The frontend initiates upgrades via `UpgradeDialog.tsx` and handles success/cancel states in `src/pages/BillingSuccess.tsx` and `src/pages/BillingCancel.tsx`.
- **Retry queue**: Fastify worker polls `gemini_retries`, retries Gemini calls with exponential backoff, and marks `habit_blueprints.status` as `pending`, `completed`, or `failed`.
- **Gemini parsing**: `blueprintParser.ts` sanitizes and repairs Gemini JSON; parse errors are logged with snippets and retried automatically.
- **Today view**: `TodayView.tsx` prioritizes tracked daily habits and action items using `useTrackedBlueprints`, while `StatsSection.tsx` displays real-time analytics (time saved, count, ratios) fetched via `useDashboardStats`.
- **History view**: Renders blueprint summaries with inline tracking toggles (habits/actions), enforces quotas via `useTrackedBlueprints`, auto-refreshes pending statuses, lazily renders cards via Intersection Observer, and offers inline deletion. Cards now display video titles and duration.
- **PWA/offline**: Auto-updating service worker caches app shell/assets, surfaces update/offline notifications, and lays groundwork for offline Blueprint viewing (caching logic is being layered into hooks incrementally).
- **Feedback flow**: `/feedback` page provides a protected RHF/Zod form with live character counter, rate-limit helper text, and success/error alerts. `/api/feedback` enforces a 10 submissions / 24h limit per user (in-memory) and relays messages to `ADMIN_EMAIL` via AWS SES SMTP.
- **Blueprint detail view**: Dedicated view powered by `BlueprintDetailView.tsx` that fetches a single record, orders sections action-first, shows metadata/overview previews, and offers a delete action that routes back to history on success.
- **Blueprint display**: Unified summary/detail renderer backed by `lib/blueprint-display.ts` for normalization, sanitizing empty entries, and consistent section mapping.
- **Deletion flow**: Radix alert dialog with synchronized overlay/content animations confirms Supabase deletions from both history cards and the detail page.
- **Supabase schema**: `habit_blueprints` includes `status`, `title`, and `duration`; `tracked_blueprints` and `blueprint_completions` persist tracking preferences and completions; `user_subscriptions` now includes `stripe_customer_id` and `stripe_subscription_id`; `gemini_retries` stores queued requests processed by the worker. A new RPC `get_user_dashboard_stats` calculates analytics.

---

## Common Contributor Tasks
- **Add a page**: Create `src/pages/NewPage.tsx`, import in `App.tsx`, update route switch, and (optionally) add navigation links.
- **Add a shadcn component**: `npx shadcn add <component>` → fix generated imports to be relative and run `npm run build:client`.
- **Add a Fastify route**: Implement `src/routes/new-route.ts`, include it in `server.ts`, and ensure it’s listed in `tsconfig.server.json`.
- **Refine large components**: When touching Landing or Dashboard, break sections into smaller components under `src/components/` to respect line targets.

---

**Last Updated**: 2025-12-05
