# Implementation Plan - Habit Blueprint MVP

## Overview
Build order prioritizes functionality over polish. Supabase auth integrated from start to enable proper local testing and avoid migration complexity.

---

## Phase 1: Foundation & Setup
**Goal**: Get development environment working with auth

### Deliverables
- [ ] Initialize Git repository
- [ ] Create `.env` file with required keys
- [ ] Configure `.gitignore` (include `.env`, `node_modules`, `dist`)
- [ ] Install dependencies (@fastify/react, Supabase, @google/generative-ai, TailwindCSS, Shadcn UI)
- [ ] Set up local Supabase (`npx supabase start`)
- [ ] Run SQL commands to create `habit_blueprints` table
- [ ] Configure Supabase client in `/lib/supabase.ts`
- [ ] Verify connection to local Supabase in browser console

### Success Criteria
- App runs on `localhost:3000`
- Supabase connection established
- No TypeScript errors

---

## Phase 2: Authentication Flow
**Goal**: Users can sign up and log in

### Deliverables
- [ ] Create auth UI components (LoginForm, SignupForm)
- [ ] Implement Supabase email/password auth
- [ ] Add auth state management (Zustand store for user state)
- [ ] Create protected route wrapper
- [ ] Build simple header with logout button
- [ ] Test auth flow: signup → login → logout

### Success Criteria
- Users can create accounts and log in
- Auth state persists across page refreshes
- Console logs show user ID after login

---

## Phase 3: Input Form & Data Collection
**Goal**: Users can input goals and content source

### Deliverables
- [ ] Create input form component with fields:
  - Primary goal (text input, required)
  - Habits to kill (optional, comma-separated)
  - Habits to develop (optional, comma-separated)
  - Content source (YouTube URL or text toggle)
- [ ] Add YouTube URL validation (client-side)
- [ ] Add video duration warning (> 90 min)
- [ ] Create text input area (for direct text input)
- [ ] Add form validation with Zod schemas
- [ ] Style with TailwindCSS + Shadcn UI components

### Success Criteria
- Form validates inputs before submission
- YouTube URLs parse correctly
- User sees helpful error messages

---

## Phase 4: YouTube Transcript Extraction
**Goal**: Extract transcripts from YouTube videos

### Deliverables
- [ ] Create transcript service using Supadata.ai REST API (no npm package needed)
- [ ] Create API route `/api/transcript` in Fastify
- [ ] Implement transcript fetching logic with HTTP requests to Supadata
- [ ] Handle errors (video unavailable, no transcript)
- [ ] Add loading state in UI
- [ ] Log transcript length to console
- [ ] Return transcript to frontend

### Success Criteria
- YouTube videos return transcripts
- Errors display user-friendly messages
- Loading indicator shows during fetch

---

## Phase 5: AI Blueprint Generation
**Goal**: Generate complete blueprint from content + goals

### Deliverables
- [ ] Configure Gemini AI client with API key from .env
- [ ] Create API route /api/generate-blueprint in Fastify
- [ ] Design AI prompt with two required outputs:
  1. **Overview**: Single cohesive text containing:
     - Summary of key insights (2-3 sentences)
     - Mistakes to avoid (2-4 common pitfalls)
     - Guidance for success (2-4 strategic tips)
  2. **Habits**: Array of 3-5 specific, sequential action steps
- [ ] Prompt includes: user goal, habits to kill, habits to develop, transcript/text
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
- Response structure is consistent JSON

---

## Phase 6: Save to Database
**Goal**: Store complete blueprints in Supabase

### Deliverables
- [ ] Create Supabase insert function in `/api/save-blueprint`
- [ ] Map form data + complete AI output to `habit_blueprints` schema
- [ ] Store entire AI response (summary, mistakes, guidance, steps) in `ai_output` JSONB field
- [ ] Handle database errors
- [ ] Return success/failure to frontend
- [ ] Test RLS policies (verify users only see own data)
- [ ] Log database operations to console

### Success Criteria
- Complete blueprints save to database (all four AI sections)
- Users can only see their own blueprints
- Database errors handled gracefully

---

## Phase 7: History Display
**Goal**: Show past blueprints to logged-in users

### Deliverables
- [ ] Create history page component
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
- History page loads user's past blueprints
- Overview displays with proper formatting (paragraph breaks)
- Habits display in clean, numbered list format
- Most recent blueprints appear first


---

## Phase 8: End-to-End Flow Integration
**Goal**: Complete user journey works seamlessly

### Deliverables
- [ ] Connect all phases: login → input → generate → save → history
- [ ] Add navigation between pages
- [ ] Implement loading states throughout flow
- [ ] Test complete flow with sample data
- [ ] Fix any discovered bugs
- [ ] Verify console logs show no errors

### Success Criteria
- User can complete full flow without errors
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
   - [ ] Landing Page - Hero, value props, how it works, FAQ
   - [ ] Enhanced Dashboard - Welcome + stats + form + analytics cards below form
   - [ ] Dedicated History Page - Search, filter, sort, pagination
   - [ ] Blueprint Detail Page - Expandable sections with smooth animations
   - [ ] Profile/Settings Page - Account, usage stats, data management (blueprint only)
   - [ ] Login Page modernization
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
- App is mobile-responsive with no visual glitches
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
