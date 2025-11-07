You are building pages using the page builder workflow system.

**This command is run ONCE per context session.** If context is lost, just run this command again with your project description.

## System Context

**Registry Configuration:**
- Registry name: `@my-patterns`
- Registry URL: `http://localhost:3000/r/{name}.json`
- Registry must be running on localhost:3000
- MCP Configuration: `.mcp.json` with shadcn server

**File Locations:**
- **Patterns Reference**: `kibo-registry/PATTERNS_GUIDE.md` - You MUST read this file
- **Pattern Browser**: https://www.kibo-ui.com/patterns - User browses this to choose Level 3
- **Page Components**: `/components/[page-name]/` - Where selected components go
- **Design Docs**: `/design-docs/pages/[page-name].md` - Created during build
- **Shared Components**: `/design-docs/shared-components/shared-components.md`

**Prerequisites:**
- Page builder infrastructure must be initialized (run `/init-page-builder` if not)
- Registry server must be running on localhost:3000 (in `kibo-registry/`)
- Next.js app must be running on localhost:3001 (NOT 3000 - that's for the registry)
  - Run with: `PORT=3001 npm run dev` or `PORT=3001 pnpm dev`

## Required Reading

**Before starting ANY build, you MUST read:**
- `kibo-registry/PATTERNS_GUIDE.md` - This contains:
  - All 53 component categories (Level 1)
  - Variation types within each category (Level 2)
  - Approximate counts of patterns per variation

## Understanding the Component Levels

```
Level 1: Component Category (e.g., "button", "form", "card")
  └─> Level 2: Variation Type (e.g., "standard", "destructive", "outline")
       └─> Level 3: Individual Pattern Numbers (e.g., 1, 2, 3, 4, 5...)
```

**How it works:**
- **AI determines**: Level 1 (category) and Level 2 (variation type) based on project needs
- **User chooses**: Level 3 (pattern number) by browsing https://www.kibo-ui.com/patterns
- **AI installs**: The specific Level 3 patterns the user selects

## Workflow

When the user describes a project or pages they want to build:

### Phase 1: Design Planning

1. **Analyze project needs**: Understand what pages are needed
2. **Reference PATTERNS_GUIDE.md**: Look up which Level 1 categories are available
3. **For each page, determine**:
   - What Level 1 categories are needed (e.g., button, form, card)
   - Which Level 2 variation type makes sense (e.g., "standard", "outline", "destructive")
   - Whether any components should be shared across pages
4. **Create design docs**:
   - Create `/design-docs/pages/[page-name].md` for each page with:
     - Page purpose and description
     - Required components listed as: **[Level 1 category] - [Level 2 variation type]**
     - Example: "button - standard", "form - validation", "card - standard"
     - Layout structure
     - Note: "User will choose Level 3 pattern numbers from kibo-ui.com"
   - Update `/design-docs/shared-components/shared-components.md` with shared components

5. **Present to user**:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Design Plan Created
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Pages: [list pages]

   For [Page Name]:
   - navigation-menu (standard) - Browse: https://www.kibo-ui.com/patterns/navigation-menu
   - button (standard) - Browse: https://www.kibo-ui.com/patterns/button
   - card (standard) - Browse: https://www.kibo-ui.com/patterns/card

   Please browse the links above and tell me which patterns you want.
   Format: "use pattern-navigation-menu-standard-3, pattern-button-standard-5, pattern-card-standard-2"
   ```

### Phase 2: Install User-Selected Patterns

1. **Wait for user to specify patterns**: User will tell you which Level 3 patterns they want
   - Example: "use pattern-button-standard-3, pattern-form-validation-2"

2. **Validate patterns**: Check that patterns match the Level 1 + Level 2 from design docs

3. **Install patterns**:
   - For EACH pattern the user specifies, install it to `/components/[page-name]/`
   - Use: `npx shadcn@latest add @my-patterns/[pattern-name]`
   - **If multiple patterns**: Install them in PARALLEL using multiple Bash tool calls in one message
   - **If pattern has dependencies** (check install output for missing components):
     - Install dependencies in PARALLEL immediately
     - Example: `npx shadcn@latest add button input label` (all at once)

4. **Track selections**: Record which patterns were installed for each page in the design doc

### Phase 3: Assemble Page

Once all patterns for a page are installed:
1. Create `/app/[page-name]/page.tsx`
2. Import all installed patterns from `/components/[page-name]/`
3. Arrange according to design doc specification
4. Handle shared components (import from shared location if applicable)
5. Test that imports work correctly

### Phase 4: Next Page

Repeat Phases 2-3 for remaining pages, reusing shared components where applicable.

## Key Rules

1. **Read PATTERNS_GUIDE.md first** - Know available Level 1 & 2
2. **AI determines Level 1 & 2** - Based on project requirements
3. **User chooses Level 3** - By browsing kibo-ui.com/patterns
4. **Use parallel installs** - Install multiple components simultaneously for performance
5. **Track everything** - Update design docs with selected patterns
6. **Be autonomous** - Create design docs automatically from user's description
7. **Provide browsing links** - Always give user direct links to pattern categories on kibo-ui.com

## Example Flow

User: "I want to build an admin dashboard with 3 pages"

**You should:**

1. Read `PATTERNS_GUIDE.md`
2. Create design docs:
   - `/design-docs/pages/dashboard-overview.md`
     - Needs: navigation-menu (standard), card (standard), chart (bar), table (standard)
   - `/design-docs/pages/settings.md`
     - Needs: navigation-menu (standard), form (validation), switch (standard)
   - `/design-docs/pages/user-profile.md`
     - Needs: navigation-menu (standard), avatar (standard), card (standard)

3. Present plan to user:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Design Plan: Admin Dashboard
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Page 1: Dashboard Overview
   - navigation-menu (standard) - https://www.kibo-ui.com/patterns/navigation-menu
   - card (standard) - https://www.kibo-ui.com/patterns/card
   - chart (bar) - https://www.kibo-ui.com/patterns/chart
   - table (standard) - https://www.kibo-ui.com/patterns/table

   Page 2: Settings
   - navigation-menu (standard) - [reuse from Page 1]
   - form (validation) - https://www.kibo-ui.com/patterns/form
   - switch (standard) - https://www.kibo-ui.com/patterns/switch

   Page 3: User Profile
   - navigation-menu (standard) - [reuse from Page 1]
   - avatar (standard) - https://www.kibo-ui.com/patterns/avatar
   - card (standard) - [reuse from Page 1]

   Please browse the patterns and tell me which ones you want to use.
   ```

4. Wait for user response:
   ```
   User: "For Dashboard Overview, use pattern-navigation-menu-standard-5,
          pattern-card-standard-2, pattern-chart-bar-default, pattern-table-standard-1"
   ```

5. Install all patterns in parallel:
   - `npx shadcn@latest add @my-patterns/pattern-navigation-menu-standard-5`
   - `npx shadcn@latest add @my-patterns/pattern-card-standard-2`
   - `npx shadcn@latest add @my-patterns/pattern-chart-bar-default`
   - `npx shadcn@latest add @my-patterns/pattern-table-standard-1`
   - (If missing dependencies, install those too in parallel)

6. Create `/app/dashboard-overview/page.tsx` with all components

7. Move to Settings page, reuse navigation, get user's form and switch choices

8. Continue until all pages complete

**Remember: You determine Level 1 & 2, user picks Level 3 by browsing the website!**