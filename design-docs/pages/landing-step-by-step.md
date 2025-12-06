## Landing Page – Step-by-Step Section

### Purpose
Refine the "How Consum works" portion of the landing page into a visually engaging, central timeline that highlights the four onboarding steps using supplied screenshot assets (`/step_by_step/Consum1.webp` – `/step_by_step/Consum4.webp`). The section should reinforce process clarity while feeling dynamic and creative on desktop, yet remain easy to scan on mobile.

### Layout Overview
1. **Section wrapper** – `section` constrained to `max-w-5xl` with `py-20 md:py-24` and responsive padding to align with Consum spacing.
2. **Intro block** – Existing title/subtitle followed by `space-y-6` to transition into steps.
3. **Desktop structure (lg and up)**
   - Three-column CSS grid `grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12`.
   - Center column hosts a vertical separator line with numbered badges stacked along the flow.
   - Left/right columns hold alternating cards containing screenshot, title, and description so steps zigzag visually.
4. **Card styling** – Medium-weight cards (`border border-border/50 bg-card/70 rounded-2xl shadow-sm`) with subtle hover lift.
5. **Mobile handling** – Collapse to single column list. Timeline line hidden; badges rest above each card with `border-l border-border/40 pl-6` accent to maintain progression.

### Required Components (Level 1 → Level 2)
- card – standard
- badge – standard (used for numbered markers)
- separator – standard (represents the vertical timeline spine)

*User will choose Level 3 patterns for each component via https://www.kibo-ui.com/patterns.*

### Assets & Content
- Use four provided screenshots in order; keep file order aligned with steps.
- Copy must remain verbatim for each step (title + paragraph provided by stakeholder).

### Notes
- Review existing landing component for file-length; extract to subcomponent if exceeding guidelines.
- Ensure timeline remains touch-friendly (>44px targets) and respects Consum weight guidance (medium-heavy mix).
