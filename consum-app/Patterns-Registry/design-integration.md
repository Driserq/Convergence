# DESIGN INTEGRATION GUIDE
Connecting Kibo UI Patterns with Consum Design System

Purpose: Help AI agents choose and style Kibo UI patterns according to visual design principles

---

## HOW TO USE PATTERNS WITH DESIGN SYSTEM

The PATTERNS_GUIDE lists 53 component categories with 1,105 total patterns.
The DESIGN_SYSTEM defines when and how to use components based on context.

This guide connects the two.

---

## PATTERN SELECTION BY CONTEXT WEIGHT

### LIGHTWEIGHT CONTEXTS: Hero Sections, Marketing Copy

AVOID THESE PATTERNS:
- DO NOT use card patterns for feature bullets
- DO NOT use badge patterns with large numbers
- DO NOT use accordion patterns in hero sections

USE STANDARD COMPONENTS DIRECTLY:
Instead of Kibo patterns, use base shadcn components:
- button (standard variation only)
- Raw lucide-react icons like CheckCircle, ArrowRight
- Minimal styling with Tailwind classes

REASONING:
Lightweight contexts need minimal visual weight. Kibo patterns often add styling that works for medium/heavy contexts but overwhelms hero sections.

---

### MEDIUM WEIGHT CONTEXTS: Feature Sections, Content Areas

USE THESE PATTERN CATEGORIES:
- card (standard variation): For feature highlights in grids
- badge (standard, secondary): For status indicators and icons
- button (standard, secondary): For secondary actions
- separator (standard): For visual breaks between sections

PATTERN STYLING ADJUSTMENTS:
When using Kibo card patterns, ensure they have:
- Border opacity at 50%: border-border/50
- Background opacity at 70%: bg-card/70
- Hover state: hover:-translate-y-1 transition-all

INSTALLATION EXAMPLE:
npx shadcn@latest add @my-patterns/pattern-card-standard-1

Then adjust opacity classes if pattern doesn't match design system.

---

### HEAVY WEIGHT CONTEXTS: CTAs, Forms, Dashboards

USE THESE PATTERN CATEGORIES:
- form (validation, multi-field variations): For user input
- field (basic-inputs, layouts variations): For form fields
- button (standard, destructive variations): For primary actions
- card (standard variation): For functional containers
- data-table (standard, advanced): For data display
- dialog (standard): For modal interactions
- alert (error, warning, success): For feedback

PATTERN STYLING:
Use Kibo patterns as-is for heavy contexts. They typically have:
- Full opacity borders and backgrounds
- Clear shadows and separations
- Proper affordance for interaction

These match heavy weight design requirements.

---

## COMPONENT SUBSTITUTION RULES

### WHEN KIBO PATTERN IS TOO HEAVY

If a Kibo pattern adds unwanted visual weight:

OPTION 1: Use base shadcn component instead
Install from standard registry: npx shadcn@latest add button

OPTION 2: Strip down Kibo pattern styling
Install pattern, then modify to reduce:
- Border opacity: Change border-border to border-border/30
- Background opacity: Change bg-card to bg-card/70
- Remove shadow: Remove shadow classes
- Reduce padding: Change p-6 to p-4

### WHEN BASE COMPONENT IS TOO LIGHT

If base shadcn feels too minimal:

OPTION 1: Add Tailwind utilities
Enhance with hover states, transitions, borders:
- Add: hover:-translate-y-1 transition-all
- Add: border border-border/50
- Add: shadow-sm hover:shadow-lg

OPTION 2: Use Kibo pattern from same category
Search for pattern with appropriate styling level.

---

## LANDING PAGE SPECIFIC GUIDANCE

### HERO SECTION
Component choices:
- button from base shadcn (NOT from Kibo patterns)
- Raw icons from lucide-react
- NO card patterns
- NO badge patterns for bullets

Styling approach:
- Minimal borders and backgrounds
- Generous whitespace with py-32
- Focus on typography

### PAIN POINTS SECTION
Component choices:
- card from Kibo patterns: pattern-card-standard-1 or similar
- badge for icons if needed: pattern-badge-standard-1

Styling approach:
- 3-column grid: grid-cols-1 md:grid-cols-3
- Medium weight styling with opacity
- Hover effects for interactivity

### FEATURES SECTION
Component choices:
- card from Kibo patterns: pattern-card-standard-2 or similar
- badge for visual anchors: pattern-badge-secondary-1

Styling approach:
- Same as pain points
- Can be more visually distinct from pain points section

### FAQ SECTION
Component choices:
- accordion from Kibo patterns: pattern-accordion-standard-1
- This is proper context for accordion patterns

Styling approach:
- Full width container
- Clear visual separation between items
- Proper expand/collapse affordance

### FOOTER
Component choices:
- separator from Kibo patterns: pattern-separator-standard-1
- button with link variant for footer links

Styling approach:
- Minimal weight
- Clear link styling
- Organized layout

---

## PATTERN INSTALLATION WORKFLOW

STEP 1: Determine context weight
Identify if section is lightweight, medium, or heavy weight context.

STEP 2: Check pattern appropriateness
Refer to context-specific pattern lists above.

STEP 3: Install pattern if appropriate
Use: npx shadcn@latest add @my-patterns/pattern-name-variation-number

STEP 4: Adjust styling if needed
Modify opacity, spacing, or other properties to match design system.

STEP 5: Verify visual hierarchy
Ensure pattern usage creates appropriate emphasis level.

---

## COMMON MISTAKES TO AVOID

MISTAKE: Installing Kibo accordion pattern for hero section feature list
SOLUTION: Use raw icons and text instead

MISTAKE: Using base shadcn card without styling for feature grid
SOLUTION: Install Kibo card pattern and adjust opacity classes

MISTAKE: Using Kibo badge pattern with large numbers in hero bullets
SOLUTION: Use small CheckCircle icon from lucide-react

MISTAKE: Installing patterns without adjusting for context weight
SOLUTION: Always review and modify pattern styling after installation

MISTAKE: Using heavy shadow and border patterns in lightweight contexts
SOLUTION: Strip down styling or use base components

---

## DECISION MATRIX

Question: Should I use a Kibo pattern or base shadcn component?

IF context is lightweight (hero, marketing copy):
  Use base shadcn components
  Apply minimal Tailwind styling
  
IF context is medium weight (features, content):
  Use Kibo patterns
  Adjust opacity if too heavy
  
IF context is heavy weight (forms, dashboards):
  Use Kibo patterns as-is
  Full styling appropriate

Question: Which Kibo pattern variation should I choose?

IF need standard styling:
  Choose pattern-name-standard-1 or pattern-name-standard-2
  
IF need special state (error, warning):
  Choose pattern-name-error-1 or pattern-name-warning-1
  
IF need different layout:
  Review variations list in PATTERNS_GUIDE
  Choose variation that matches layout needs

---

## INTEGRATION CHECKLIST

Before using any Kibo pattern:
- [ ] Identified context weight (lightweight, medium, heavy)
- [ ] Verified pattern is appropriate for context
- [ ] Checked DESIGN_SYSTEM for styling requirements
- [ ] Installed pattern using npx command
- [ ] Adjusted opacity and spacing if needed
- [ ] Tested visual hierarchy in context
- [ ] Ensured responsive behavior works
- [ ] Verified accessibility requirements met

---

## EXAMPLE: LANDING PAGE REBUILD

Context: Landing page with hero, pain points, features, FAQ, footer

HERO SECTION:
- Use: Base shadcn button
- Use: Raw CheckCircle icons
- Avoid: Kibo card patterns
- Avoid: Kibo badge patterns
Result: Clean, text-focused hero

PAIN POINTS SECTION:
- Use: Kibo pattern-card-standard-1
- Adjust: border-border/50, bg-card/70
- Use: pattern-badge-standard-1 for icons
Result: Organized feature grid

FEATURES SECTION:
- Use: Kibo pattern-card-standard-2
- Keep: Full styling from pattern
Result: Visually distinct from pain points

FAQ SECTION:
- Use: Kibo pattern-accordion-standard-1
- Keep: Full accordion styling
Result: Functional collapsible content

FOOTER:
- Use: Kibo pattern-separator-standard-1
- Use: Base shadcn button with link variant
Result: Clean footer with clear links

---

END OF DESIGN INTEGRATION GUIDE
