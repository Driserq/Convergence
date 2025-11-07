# Convergence (Habit Blueprint MVP) - Warp Project Rules

## Project Overview
MVP that transforms self-improvement content into actionable habit blueprints. Users input goals + content (YouTube/text) → AI generates overview (summary, mistakes, guidance) + 3-5 sequential action steps.

## Tech Stack (Current)
- **Frontend/Backend**: @fastify/react (SSR, single server)
- **Database/Auth**: Supabase (PostgreSQL + RLS)
- **AI**: Google Gemini 2.5 Flash (1M token context, free tier)
- **UI**: TailwindCSS + Shadcn UI + Zustand
- **Deployment**: Local Supabase (Docker) → Digital Ocean App Platform

## File Structure
src/
├── server.ts # Fastify server entry
├── components/ # React components
├── pages/ # Page components
├── lib/ # Utilities (supabase.ts, gemini.ts)
├── hooks/ # Custom React hooks
├── types/ # TypeScript types
├── routes/ # Fastify API routes
└── styles/ # Global styles

DOCS/
├── TECH_STACK.md # Detailed tech decisions
├── SCHEMA.md # Database schema + SQL
├── rules.md # Coding standards
├── PLAN.md # Development phases
├── PROJECT_SETUP.md # Setup instructions
└── EXAMPLES.md # Sample data


## Core Development Rules

### Code Style
- **TypeScript strict mode** - No `any` types
- **Max file length**: Components 200 lines, others 300 lines
- **Max function length**: API routes 50 lines, utilities 30 lines
- **Naming**: Components PascalCase, utilities camelCase, constants UPPER_SNAKE_CASE

### Environment & Workflow
- **Local testing**: Use `npm run dev` (Supabase Docker at localhost:54321)
- **Production**: Push to `main` branch → auto-deploys to Digital Ocean
- **No staging environment** until >1,000 users (MVP speed priority)
- **Environment files**: `.env.local` (local), `.env.production` (prod) - never commit

### Error Handling
- **Console logging only** for MVP (no toast libraries yet)
- Format: `console.error('[ComponentName] Error:', error)`
- All async operations must have try-catch blocks
- Display user-friendly messages (not raw errors)

### API Integration Rules
- **Gemini AI**: Use `gemini-2.5-flash` model, 45-second timeout, must return JSON with `overview` (text) + `habits` (array)
- **YouTube Transcripts**: Warn if video >90 minutes, handle "transcript unavailable" errors
- **Supabase**: Use RLS policies (no manual filtering), use `.from()` query builder

### Database Schema
- **Table**: `habit_blueprints` with columns: id, user_id, goal, habits_to_kill, habits_to_develop, content_source, content_type, ai_output (JSONB)
- **AI Output Structure**: `{ overview: "text with \n\n breaks", habits: [{id, title, description, timeframe}] }`
- See `DOCS/SCHEMA.md` for complete SQL

### Security
- **Never expose API keys** to client (server-side only)
- **Validate inputs** with Zod schemas
- **Sanitize YouTube URLs** before processing
- **RLS enabled** on all Supabase tables

## Key References
- **Development phases**: See `DOCS/PLAN.md` (12 phases from auth → deployment)
- **Setup instructions**: See `DOCS/PROJECT_SETUP.md` for npm commands
- **Coding standards**: See `DOCS/rules.md` for detailed style guide
- **Database setup**: See `DOCS/SCHEMA.md` for SQL commands
- **⚠️ Import paths**: See `DOCS/IMPORT_GUIDELINES.md` - CRITICAL for avoiding Vite build errors
- **KiboUI patterns**: See `DOCS/KIBOUI_URL_FORMAT.md` - URL format for browsing patterns

## Current Phase
**Phase 1**: Foundation & Setup (in progress)
Next: Phase 2 - Authentication Flow

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
