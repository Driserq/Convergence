# Convergence (Habit Blueprint MVP) - Warp Project Rules

## Project Overview
MVP that transforms self-improvement content into actionable habit blueprints. Users input goals plus optional content (YouTube/text) → AI generates overview (summary, mistakes, guidance) and 3-5 sequential action steps.

## Tech Stack (Current)
- **Frontend**: React 19 + Vite 7 (client build served from `dist/client`)
- **Backend**: Fastify 5 TypeScript server serving static client assets and API routes
- **Database/Auth**: Supabase (PostgreSQL + RLS)
- **AI**: Google Gemini 2.0 Flash Experimental (current API usage, 45s timeout target)
- **UI**: TailwindCSS v4 + Shadcn UI + Zustand
- **Deployment Target**: Local Supabase (Docker) → Digital Ocean App Platform

## File Structure
src/
├── server.ts # Fastify server entry (serves built client + APIs)
├── App.tsx # SPA router shell
├── components/ # React components (shadcn + custom)
├── pages/ # Page-level components
├── hooks/ # Zustand-backed auth + other hooks
├── lib/ # Utilities (supabase clients, transcript, gemini placeholders)
├── routes/ # Fastify API routes (e.g., blueprint.ts)
└── styles/ # Global styles (Tailwind v4)

DOCS/
├── TECH_STACK.md # Detailed tech decisions
├── SCHEMA.md # Database schema + SQL
├── AGENTS.md # Coding standards for contributors
├── PLAN.md # Development phases
├── PROJECT_SETUP.md # Setup instructions
└── IMPORT_GUIDELINES.md # Relative import policy


## Core Development Rules

### Code Style
- **TypeScript strict mode** - `strict` enabled for client config
- **File size targets**: Components ≤200 lines, other modules ≤300 lines (current dashboard/landing exceed; schedule refactors)
- **Naming**: Components PascalCase, utilities camelCase, constants UPPER_SNAKE_CASE
- **Imports**: Relative paths preferred even though `@` alias exists in configs

### Environment & Workflow
- **Local testing**: `npm run dev` (runs `vite build` once, watches Fastify via `tsx`) with Supabase Docker at localhost:54321
- **Client dev only**: `npm run dev:client` launches Vite dev server on 5173 (proxy to Fastify 3001)
- **Production**: `npm run build` → `npm start`; push to `main` when ready for Digital Ocean deploy
- **Environment files**: `.env`, `.env.local`, `.env.production` - never commit upstream

### Error Handling
- **Console logging only** for MVP (no toast libraries yet)
- Format: `console.error('[ComponentName] Error:', error)`
- All async operations must have try-catch blocks
- Display user-friendly messages (not raw errors)
- Loading indicators required for long-running actions (form submit, AI calls)

### API Integration Rules
- **Gemini AI**: Current route calls `gemini-2.0-flash-exp`; align SDK wrapper in `lib/gemini.ts`, enforce 45-second timeout, and return JSON with overview + sequenced habits
- **YouTube Transcripts**: Warn if video >90 minutes, handle "transcript unavailable" errors (via Supadata REST API)
- **Supabase**: Use RLS policies (no manual filtering), use `.from()` query builder
- **Routes**: API handlers live in `src/routes` and are registered from `server.ts`

### Database Schema
- **Table**: `habit_blueprints` with columns: id, user_id, goal, habits_to_kill, habits_to_develop, content_source, content_type, ai_output (JSONB)
- **AI Output Structure**: `{ overview: { summary, mistakes[], guidance[] }, sequential_steps?: [], daily_habits?: [], trigger_actions?: [], decision_checklist?: [], resources?: [] }`
- See `DOCS/SCHEMA.md` for complete SQL

### Security
- **Never expose API keys** to client (server-side only)
- **Validate inputs** with Zod schemas
- **Sanitize YouTube URLs** before processing
- **RLS enabled** on all Supabase tables

## Key References
- **Development phases**: See `DOCS/PLAN.md` (12 phases from auth → deployment)
- **Setup instructions**: See `DOCS/PROJECT_SETUP.md` for npm commands
- **Coding standards**: See `DOCS/AGENTS.md` for contributor rules
- **Database setup**: See `DOCS/SCHEMA.md` for SQL commands
- **⚠️ Import paths**: See `DOCS/IMPORT_GUIDELINES.md` - CRITICAL for avoiding Vite build errors
- **KiboUI patterns**: See `DOCS/KIBOUI_URL_FORMAT.md` - URL format for browsing patterns

## Current Phase
**Phase 3-4**: Dashboard + Blueprint form UI under active development
Next: Phase 4-5 integration (transcript + Gemini pipeline)

## Important Constraints
- **MVP timeline**: 1-2 weeks build time
- **Budget**: <$500 (using free tiers)
- **Philosophy**: Simplicity first, functionality over polish, no premature optimization
- **Target**: 100-500 users, >30% repeat usage

## When to Reference Other Docs
- Need SQL commands? → `DOCS/SCHEMA.md`
- Need setup steps? → `DOCS/PROJECT_SETUP.md`
- Need phase details? → `DOCS/PLAN.md`
- Need tech justifications? → `DOCS/TECH_STACK.md`
