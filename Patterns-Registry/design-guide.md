# CONVERGENCE DESIGN SYSTEM
AI-Optimized Design Guidelines

Last Updated: 2025-11-06
Purpose: Teach AI agents to build visually appropriate UI across all contexts

---

## CORE DESIGN PHILOSOPHY

Progressive Visual Weight: Elements gain prominence proportional to their importance and required user attention.

WEIGHT SCALE:
- Marketing content: Minimal, text-focused, clean
- Feature highlights: Medium weight with cards
- Interactive elements: Clear, prominent with good affordance
- Dashboards and apps: Functional, organized, efficient

---

## COMPONENT WEIGHT BY CONTEXT

### LIGHTWEIGHT CONTEXTS
Used for: Hero sections, headers, marketing copy, landing page intro content

GOAL: Let content breathe. Focus on typography and whitespace.

COMPONENT CHOICES:
- Raw text with small icons from lucide-react library
- Minimal borders at 30% opacity or none
- Transparent or subtle backgrounds at 50% opacity
- Small badges for status indicators only, not for decoration
- Generous whitespace with gap-6 or gap-8

PATTERN EXAMPLE:
div with flex items-start gap-3
  Icon with size-5 text-primary mt-0.5 shrink-0
  p with text-lg text-foreground/90

ANTI-PATTERNS FOR LIGHTWEIGHT CONTEXTS:
- Do NOT use Card components for simple lists
- Do NOT use large Badge components with numbers
- Do NOT use heavy borders or solid backgrounds
- Do NOT stack bulky components vertically in hero sections

---

### MEDIUM WEIGHT CONTEXTS
Used for: Feature cards, content sections, benefits display, comparison sections

GOAL: Organized information with visual interest.

COMPONENT CHOICES:
- Card component with subtle styling
- Borders at 50% opacity
- Gentle backgrounds at 70% opacity
- Hover states with subtle lifts using hover:-translate-y-1
- Icons or badges as visual anchors
- Grid layouts for organization

PATTERN EXAMPLE:
Card with border-border/50 bg-card/70 hover:-translate-y-1 transition-all
  CardHeader
    div with size-10 rounded-lg bg-primary/10 flex items-center justify-center
      Icon with size-5 text-primary
    CardTitle
  CardContent
    p with text-muted-foreground

---

### HEAVY WEIGHT CONTEXTS
Used for: Call-to-action sections, forms, interactive components, dashboards, data tables

GOAL: Clear interaction points and functional organization.

COMPONENT CHOICES:
- Full opacity borders
- Solid backgrounds
- Prominent shadows from shadow-sm to shadow-lg
- Clear visual separation between sections
- Form elements with proper field styling
- Action buttons with substantial size and contrast

PATTERN EXAMPLE:
Card with border-border bg-card shadow-lg
  CardContent with p-8
    h3 with text-2xl font-bold
    Button with size-lg w-full mt-4

---

## UNIVERSAL LAYOUT SPECIFICATIONS

### SPACING SCALE
Section vertical padding: py-20 for standard sections, py-32 for hero or emphasized sections
Container max width: max-w-6xl or max-w-7xl
Card padding: p-6 default, p-8 for important cards
Element gaps: gap-3 for tight lists, gap-6 for cards, gap-12 between major sections

### GRID PATTERNS
Features and benefits: grid-cols-1 md:grid-cols-3
Comparison or before-after: grid-cols-1 md:grid-cols-2
Complex layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

### BORDER RADIUS CONSISTENCY
Small elements: rounded-lg for buttons, badges, small icons
Cards and containers: rounded-2xl
Full components: rounded-3xl for rare special cases only
Circles: rounded-full for icons and avatars

---

## COMPONENT SELECTION DECISION TREE

### WHEN TO USE RAW ICONS
Icons from lucide-react should be used directly for:
- Lists and bullet points
- Small indicators next to text
- Navigation items
- Inline elements

DO NOT use Badge component for simple checkmarks in lists.

### WHEN TO USE BADGE COMPONENT
Badge component should be used for:
- Status indicators showing states like new, beta, pro
- Counts and numerical values
- Category tags and labels

DO NOT use Badge for decorative icons in feature lists.

### WHEN TO USE CARD COMPONENT
Card component should be used for:
- Feature highlights in grid layouts
- Content sections requiring visual separation
- Dashboard widgets
- Form containers

DO NOT use Card in hero sections for simple lists.
DO NOT use Card when plain text would be clearer.

### WHEN TO USE ACCORDION COMPONENT
Accordion component should be used for:
- FAQ sections
- Collapsible content in sidebars
- Settings panels with multiple options

DO NOT use Accordion in hero sections.
DO NOT use Accordion for primary navigation.

### BUTTON SIZING BY IMPORTANCE
Primary CTA buttons in hero sections: size lg
Standard action buttons in forms: default size
Subtle inline actions: size sm with variant ghost

---

## VISUAL HIERARCHY DECISION CHECKLIST

Before adding styling to any element, evaluate:

ATTENTION REQUIREMENT:
- High attention: Use solid background, visible border, shadow
- Medium attention: Use subtle background, faint border
- Low attention: Use text with icon only

PRIMARY ACTION STATUS:
- Primary action: Large button, primary variant, prominent placement
- Secondary action: Smaller size, secondary variant, or link variant

CONTENT RELATIONSHIP:
- Content separation: Use Card with borders
- Content grouping: Use div with gap spacing

ELEMENT PURPOSE:
- Decorative: Keep subtle with opacity and light colors
- Functional: Make clear with solid colors and borders

---

## IMPLEMENTATION EXAMPLES BY PAGE TYPE

### LANDING PAGE HERO SECTION
Structure: Headline, subtext, clean feature list, primary CTA

section with py-32
  h1 with large text
  p with text-xl text-muted-foreground
  
  Feature list without Card components
  div with space-y-3
    for each feature
      div with flex items-start gap-3
        CheckCircle icon with size-5 text-primary
        p with feature text
  
  Button with size-lg for primary CTA

CRITICAL: Do NOT wrap feature list items in Card components in hero sections.

### FEATURE SHOWCASE SECTION
Structure: Section heading, grid of feature cards

section with py-20
  h2 with section heading
  div with grid md:grid-cols-3 gap-6
    for each feature
      Card with border-border/50 bg-card/70
        CardHeader
          Icon component
          CardTitle
        CardContent with description

This is the appropriate context for Card components.

### DASHBOARD WIDGET
Structure: Functional container with data display

Card with border-border bg-card shadow-sm
  CardHeader
    CardTitle
  CardContent
    Data display component like Table or Chart

Full styling weight appropriate for functional interfaces.

---

## QUICK REFERENCE DECISION GUIDE

QUESTION: Should I use a Card or just a div?
ANSWER FLOW:
1. Is this a hero section? Use div
2. Is this a simple list? Use div
3. Does content need visual separation? Use Card
4. Is this grouped content like feature or widget? Use Card

QUESTION: Should I use Badge or just an icon?
ANSWER FLOW:
1. Is this a checkmark in a list? Use icon
2. Is this showing status or count? Use Badge
3. Is this purely decorative? Use icon

QUESTION: How much spacing should I use?
ANSWER FLOW:
1. Hero section? Use py-32 and gap-8
2. Content section? Use py-20 and gap-6
3. Tight list? Use gap-3
4. Between major sections? Use gap-12

---

## ANTI-PATTERNS TO AVOID

HERO SECTION MISTAKES:
- DO NOT use accordion-style stacked cards for feature bullets
- DO NOT over-style bullet points with heavy backgrounds
- DO NOT make numbered badges large and prominent
- DO NOT stack large bordered boxes vertically when text alone would work

CARD USAGE MISTAKES:
- DO NOT use cards for every piece of content
- DO NOT nest cards within cards without clear purpose
- DO NOT use cards in lightweight contexts where text suffices

SPACING MISTAKES:
- DO NOT use inconsistent spacing scales
- DO NOT cram content without adequate whitespace
- DO NOT over-space to the point of disconnection

COMPONENT WEIGHT MISTAKES:
- DO NOT use heavy styling in marketing contexts
- DO NOT use minimal styling for functional interactions
- DO NOT mix weight levels inconsistently within same context

---

## COLOR AND OPACITY GUIDELINES

BACKGROUND OPACITY BY CONTEXT:
Lightweight contexts: bg-background/50 or bg-card/70
Medium weight contexts: bg-card/80
Heavy weight contexts: bg-card or bg-background with full opacity

BORDER OPACITY BY CONTEXT:
Lightweight contexts: border-border/30 or none
Medium weight contexts: border-border/50
Heavy weight contexts: border-border with full opacity

TEXT OPACITY:
Primary content: text-foreground with full opacity
Secondary content: text-muted-foreground
Tertiary content: text-foreground/60 or text-muted-foreground/80

---

## SHADOW HIERARCHY

SHADOW USAGE BY IMPORTANCE:
Hero elements: shadow-sm or none
Cards at rest state: shadow-sm
Cards on hover state: shadow-lg
Call-to-action sections: shadow-md
Elevated components like modals: shadow-xl

---

## RESPONSIVE DESIGN GUIDELINES

BREAKPOINT USAGE:
Mobile first: Default styles apply to mobile
Tablet: md: prefix for 768px and above
Desktop: lg: prefix for 1024px and above

GRID RESPONSIVENESS:
Always start with grid-cols-1 for mobile
Use md:grid-cols-2 or md:grid-cols-3 for larger screens
Adjust gap sizes for different screen sizes when needed

SPACING RESPONSIVENESS:
Reduce py-32 to py-20 on mobile if content feels too spread
Keep gap values consistent but can reduce on mobile if necessary

---

## ACCESSIBILITY REQUIREMENTS

INTERACTIVE ELEMENTS:
All buttons must have clear hover and focus states
Use focus-visible for keyboard navigation indicators
Ensure sufficient color contrast for all text

ICON USAGE:
Decorative icons must have aria-hidden attribute
Functional icons must have accessible labels
Use lucide-react icons consistently across the app

SEMANTIC HTML:
Use proper heading hierarchy h1 through h6
Use section elements for major page divisions
Use nav elements for navigation groups

---

## FINAL GUIDELINES

CONSISTENCY PRINCIPLE:
Maintain consistent patterns within same context type
Use same component weights for same purposes across pages
Keep spacing scales uniform throughout application

SIMPLICITY PRINCIPLE:
When in doubt, use less styling rather than more
Let content hierarchy emerge from typography and spacing
Add visual weight only when it serves clear purpose

CONTEXT AWARENESS:
Always consider where component will be used before styling
Marketing pages need different treatment than app interfaces
Adjust component weight to match context importance

---

END OF DESIGN SYSTEM