# Tech Stack - Habit Blueprint MVP

## Frontend Framework
- **@fastify/react** - Single server architecture (SSR + API routes)
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn UI** - Component library with TailwindCSS
- **Zustand** - Lightweight state management

## Backend/API
- **@fastify/react** - Integrated backend (same server as frontend)
- **Node.js** - Runtime environment

## Database & Authentication  
- **Supabase** - Postgres database + Auth + Storage
- **@supabase/supabase-js** - JavaScript client library

## External APIs
- **Google Gemini API** - Gemini 2.5 Flash for content processing
- **YouTube Data API** - Video transcript extraction (fallback to youtube-transcript npm)

## Development & Local Testing
- **Supabase CLI** - Local development stack (runs on localhost:54321)
- **Docker** - Required for Supabase local development
- **npm** - Package management

## Deployment & Hosting
- **Digital Ocean App Platform** - Production hosting
- **Environment Variables** - Managed through platform

## Development Libraries
- **youtube-transcript** - Extract YouTube video transcripts
- **@google/generative-ai** - Google Gemini AI SDK
- **axios** - HTTP client for API calls
- **zod** - Runtime type validation
- **@types/node** - TypeScript definitions

## Local Development Setup
Install Supabase CLI  
npm install supabase --save-dev

Initialize Supabase locally  
npx supabase init

Start local Supabase stack  
npx supabase start

Access at: http://localhost:54321 (API) and http://localhost:54323 (Studio)

Environment variables for local development:  
SUPABASE_URL=http://localhost:54321  
SUPABASE_ANON_KEY=<generated_by_cli>  
GOOGLE_AI_API_KEY=<your_google_ai_key>

## Production Environment Variables
SUPABASE_URL=<production_supabase_url>  
SUPABASE_ANON_KEY=<production_anon_key>  
GOOGLE_AI_API_KEY=<your_google_ai_key>

## Key Benefits for MVP
- **Single Server**: @fastify/react removes frontend/backend separation complexity
- **Local Testing**: Full Supabase stack runs locally - no deployment needed for testing  
- **Fast Development**: Hot reload for both frontend and backend code
- **Type Safety**: TypeScript used throughout the stack
- **Cost Effective**: Supabase free tier + Gemini free tier (1,500 requests/day) + Digital Ocean $5/month
- **Massive Context**: Gemini 2.5 Flash supports 1M token context window (vs 128K for GPT-4o-mini)
