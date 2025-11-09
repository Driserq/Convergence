# Implementation Plan - Habit Blueprint MVP

## Overview
Build order prioritizes functionality over polish. Supabase auth integrated from start to enable proper local testing and avoid migration complexity.

---

## Phase 1: Foundation & Setup
**Goal**: Get development environment working with auth

### Deliverables
- [x] Initialize Git repository
- [x] Create `.env` file with required keys
- [x] Configure `.gitignore` (include `.env`, `node_modules`, `dist`)
- [x] Install dependencies (@fastify/react, Supabase, @google/generative-ai, TailwindCSS, Shadcn UI)
- [ ] Set up local Supabase (`npx supabase start`)
- [ ] Run SQL commands to create `habit_blueprints` table
- [x] Configure Supabase client in `/lib/supabase.ts`
- [ ] Verify connection to local Supabase in browser console

### Success Criteria
- App runs on `localhost:3000`
- Supabase connection established
- No TypeScript errors

---

## Phase 2: Authentication Flow
**Goal**: Users can sign up and log in

### Deliverables
- [x] Create auth UI components (LoginForm, SignupForm)
- [x] Implement Supabase email/password auth
- [x] Add auth state management (Zustand store for user state)
- [x] Create protected route handling in `App.tsx`
- [x] Build header with logout button (Navigation component)
- [ ] Test auth flow: signup → login → logout

-### Success Criteria
- Users can create accounts and log in (manual end-to-end verification still pending)
- Auth state persists across page refreshes
- Console logs show user ID after login

---

## Phase 3: Input Form & Data Collection
**Goal**: Users can input goals and content source

### Deliverables
- [x] Create input form component with fields:
  - Primary goal (text input, required)
  - Habits to kill (optional, comma-separated)
  - Habits to develop (optional, comma-separated)
  - Content source (YouTube URL or text toggle)
- [x] Add YouTube URL validation (client-side)
- [ ] Add video duration warning (> 90 min)
- [x] Create text input area (for direct text input)
- [x] Add form validation with Zod schemas
- [ ] Style with TailwindCSS + Shadcn UI components

### Success Criteria
- Form validates inputs before submission (duration warning pending)
- YouTube URLs parse correctly
- User sees helpful error messages

---

## Phase 4: YouTube Transcript Extraction
**Goal**: Extract transcripts from YouTube videos

### Deliverables
- [x] Create transcript service using Supadata.ai REST API (no npm package needed)
- [ ] Create API route `/api/transcript` in Fastify (route file exists; needs registration in `server.ts`)
- [x] Implement transcript fetching logic with HTTP requests to Supadata
- [x] Handle errors (video unavailable, no transcript)
- [x] Add loading state in UI
- [x] Log transcript length to console
- [x] Return transcript to frontend (currently through the blueprint pipeline)

### Success Criteria
- YouTube videos return transcripts (dedicated `/api/transcript` endpoint registration still outstanding)
- Errors display user-friendly messages
- Loading indicator shows during fetch

---

## Phase 5: AI Blueprint Generation
**Goal**: Generate complete blueprint from content + goals

### Deliverables
- [ ] Configure Gemini AI SDK wrapper in `src/lib/gemini.ts` (current implementation uses direct fetch in route)
- [x] Create API route for blueprint generation (currently `/api/create-blueprint`)
- [x] Design AI prompt with two required outputs:
  1. **Overview**: Single cohesive text containing:
     - Summary of key insights (2-3 sentences)
     - Mistakes to avoid (2-4 common pitfalls)
     - Guidance for success (2-4 strategic tips)
  2. **Habits**: Array of 3-5 specific, sequential action steps
- [x] Prompt includes: user goal, habits to kill, habits to develop, transcript/text
- [ ] Implement Gemini API call (gemini-2.5-flash model)
- [ ] Parse AI response and validate JSON structure
- [ ] Handle AI errors (timeout, rate limit, invalid response)
- [ ] Return complete structured blueprint to frontend

### AI Prompt Structure Example:
You are a habit formation expert. Analyze this content and create a personalized habit blueprint.

User Goal: {goal}
Habits to Eliminate: {habits_to_kill}
Habits to Develop: {habits_to_develop}
Content: {transcript or text}

Generate a JSON response with exactly two sections:

"overview": A single cohesive text block that includes:

A 2-3 sentence summary of the key insights from the content

Common mistakes to avoid when implementing these ideas

Strategic guidance for success

Use paragraph breaks (\n\n) to separate these elements naturally.

"habits": An array of 3-5 actionable habit steps, each with:

id: number

title: short descriptive title

description: specific, actionable instruction

timeframe: when to implement (e.g., "Week 1", "Week 1-2")

Make habits specific, sequential, and directly related to the user's goal.

### Success Criteria
- AI generates both sections (overview + habits)
- Overview is cohesive and contains insights, mistakes, and guidance
- Habits are specific and actionable (3-5 steps)
- Response structure is consistent JSON (current handler still normalizing Gemini fetch output)

---

## Phase 6: Save to Database
**Goal**: Store complete blueprints in Supabase

### Deliverables
- [x] Create Supabase insert helper (`saveBlueprintToDatabase` in `src/lib/database.ts`)
- [x] Map form data + complete AI output to `habit_blueprints` schema
- [x] Store entire AI response (summary, mistakes, guidance, steps) in `ai_output` JSONB field
- [x] Handle database errors
- [x] Return success/failure to frontend
- [ ] Test RLS policies (verify users only see own data)
- [x] Log database operations to console

### Success Criteria
- Complete blueprints save to database (all four AI sections)
- Users can only see their own blueprints (RLS verification outstanding)
- Database errors handled gracefully

---

## Phase 7: History Display
**Goal**: Show past blueprints to logged-in users

### Deliverables
- [ ] Create history page component (placeholder exists; needs Supabase data wiring)
- [ ] Fetch blueprints from Supabase (`SELECT * FROM habit_blueprints WHERE user_id = ...`)
- [ ] Display blueprints in card format:
  - Goal
  - Timestamp
  - Content source
  - Overview (visible by default, formatted with line breaks)
  - Habits to Implement (expandable section with list)
- [ ] Add sorting (most recent first)
- [ ] Add empty state (no blueprints yet)
- [ ] Style with TailwindCSS

### Success Criteria
- History page loads user's past blueprints (current page is static placeholder)
- Overview displays with proper formatting (paragraph breaks)
- Habits display in clean, numbered list format
- Most recent blueprints appear first


---

## Phase 8: End-to-End Flow Integration
**Goal**: Complete user journey works seamlessly

### Deliverables
- [ ] Connect all phases: login → input → generate → save → history
- [x] Add navigation between pages (Navigation component + RouterContext)
- [ ] Implement loading states throughout flow
- [ ] Test complete flow with sample data
- [ ] Fix any discovered bugs
- [ ] Verify console logs show no errors

### Success Criteria
- User can complete full flow without errors (blocked by pending Supabase integration on history page)
- Complete data (summary, mistakes, guidance, steps) persists correctly
- UI feels responsive (loading indicators work)

---

## Phase 9: UI Polish & Refinement
**Goal**: Complete page structure with polished UI using Kibo UI components

### Page Structure (Updated)
**Public Pages (Unauthenticated):**
- Landing Page (`/`) - Marketing page with value prop, demo, FAQ
- Login Page (`/login`) - Authentication

**Protected Pages (Authenticated):**
- Dashboard Page (`/dashboard`) - Stats + blueprint creation form + analytics cards
- History Page (`/history`) - Dedicated past blueprints page
- Blueprint Detail Page (`/blueprints/[id]`) - Individual blueprint view
- Profile/Settings Page (`/profile`) - Account management, data export, preferences

**Support Pages:**
- 404 Page - Error handling

### Implementation Order
1. **Foundation Setup**
   - [ ] Sync Kibo UI registry components via shadcn MCP
   - [ ] Create UI inventory and route map documentation (DOCS/UI_INVENTORY.md)
   - [ ] Establish AppShell layout and enhanced Header with navigation

2. **Page Development**
   - [ ] Landing Page - Hero, value props, how it works, FAQ (initial content live; needs polishing + responsiveness passes)
   - [ ] Enhanced Dashboard - Welcome + stats + form + analytics cards below form (baseline UI in place with static metrics)
   - [ ] Dedicated History Page - Search, filter, sort, pagination
   - [ ] Blueprint Detail Page - Expandable sections with smooth animations
   - [ ] Profile/Settings Page - Account, usage stats, data management (blueprint only)
   - [ ] Login Page modernization (current version functional but utilitarian)
   - [ ] Support pages (404, error states, loading states)

3. **Dashboard Analytics Cards** (Below blueprint form)
   - [ ] Content Processed (30 days) - Count of blueprints created
   - [ ] Time Saved (30 days) - YouTube duration + text reading time calculation
   - [ ] Content Type Ratio (30 days) - YouTube vs Text percentage split
   - [ ] Data source: Supabase + Supadata API + reading time formula (200 WPM)

4. **Cross-cutting Polish**
   - [ ] Consistent spacing (space-y-6/8, card p-6 sm:p-8)
   - [ ] Button states (hover, active, disabled with loading)
   - [ ] Error message styling (inline + form-level alerts)
   - [ ] Empty states with helpful CTAs
   - [ ] Smooth transitions (motion-safe classes)
   - [ ] Accessibility (labels, aria-*, skip links, keyboard nav)
   - [ ] Visual hierarchy (section headings, separators, color accents)
   - [ ] Mobile responsiveness (iPhone SE + Android widths)

> Many components already include disabled/loading states and inline error messaging; keep this checklist to track remaining polish gaps.

5. **TypeScript & Data Integration**
   - [ ] Strict types, no `any`, align UI with DOCS/SCHEMA.md
   - [ ] Data hooks (useAnalytics, useBlueprints) with try-catch
   - [ ] Respect RLS policies, 45-second AI timeout handling

### Kibo UI Components to Add
- **Core inputs**: button, input, textarea, select, label, checkbox, radio-group, switch, form
- **Layout**: card, tabs, accordion, collapsible, separator, scroll-area
- **Feedback**: alert, badge, progress, skeleton, tooltip
- **Navigation**: navigation-menu, breadcrumb, pagination, dropdown-menu
- **Overlays**: dialog, sheet
- **Helpers**: command (combobox), avatar, cn utility

### Success Criteria
- UI looks polished and professional
- App is mobile-responsive with no visual glitches (current pages need additional responsive QA)
- Clear visual distinction between blueprint sections
- Smooth transitions for expandable sections
- All 6 pages functional with proper navigation
- Analytics cards show meaningful 30-day metrics
- Strict TypeScript, components under 200 lines each
- Accessibility compliant (keyboard nav, screen readers)

---

## Phase 10: Error Handling & Edge Cases
**Goal**: Handle failures gracefully

### Deliverables
- [ ] Test with invalid YouTube URLs
- [ ] Test with very long videos (> 2 hours)
- [ ] Test with videos without transcripts
- [ ] Test with empty text input
- [ ] Test AI timeout scenarios
- [ ] Test database connection failures
- [ ] Test malformed AI responses (missing sections)
- [ ] Add user-friendly error messages for all cases
- [ ] Implement retry logic where appropriate

### Success Criteria
- App never crashes
- All errors display helpful messages
- Users know what to do when errors occur
- Graceful fallback if AI doesn't return all four sections

---

## Phase 11: Deployment Preparation
**Goal**: Deploy to Digital Ocean App Platform

### Deliverables
- [ ] Create production Supabase project at supabase.com
- [ ] Run SQL schema in production Supabase
- [ ] Create `.env.production` with production Supabase credentials
- [ ] Test locally one final time (`npm run dev`)
- [ ] Create production build locally to verify (`npm run build`)
- [ ] Push to GitHub (`git push origin main`)
- [ ] Configure Digital Ocean App Platform:
  - Connect GitHub repo
  - Add environment variables from `.env.production`
  - Set build command: `npm run build`
  - Set run command: `npm start`
- [ ] Deploy to Digital Ocean
- [ ] Verify deployment (test auth, input, generation, history)
- [ ] Monitor Digital Ocean logs for errors

### Success Criteria
- App is live and accessible
- All features work in production
- No console errors in production
- Local and production databases are separate


---

## Phase 12: MVP Launch & Testing
**Goal**: Get 100-500 users and validate concept

### Deliverables
- [ ] Prepare launch post (Reddit, Product Hunt)
- [ ] Add basic analytics (track blueprint creation count)
- [ ] Monitor user feedback
- [ ] Fix critical bugs quickly
- [ ] Measure repeat usage (>30% target)
- [ ] Collect user testimonials

### Success Criteria
- 100-500 users sign up
- >30% create multiple blueprints
- Positive feedback on concept (especially summary + mistakes/guidance sections)

---

## Dependencies
- **Phase 2 depends on Phase 1**: Auth needs foundation
- **Phase 4 depends on Phase 3**: Can't fetch transcripts without input
- **Phase 5 depends on Phase 4**: AI needs transcript/text
- **Phase 6 depends on Phase 5**: Must have complete blueprint before saving
- **Phase 7 depends on Phase 6**: History requires saved data
- **Phase 8 depends on Phases 2-7**: Integration needs all pieces

## Notes
- Prioritize console logging throughout to catch issues early
- Test each phase thoroughly before moving to next
- Keep commits small and focused on single features
- If stuck on a phase, move to next and circle back
- The enhanced AI output (summary, mistakes, guidance) differentiates this from simple to-do generators
