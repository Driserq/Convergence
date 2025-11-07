# Landing Page Design Document

## 1. Goals & Audience
- Convert first‑time visitors into authenticated users by routing primary CTAs to `/login`.
- Target users overwhelmed by self-improvement content archives.
- Maintain existing copy tone while modernizing UI with Kibo patterns.

## 2. Section Blueprint (Component-Only View)
| Page Section | Button Variations | Card Variations | Badge Variations | Accordion Variations | Separator Usage |
| --- | --- | --- | --- | --- | --- |
| Hero | standard (primary CTA), link (secondary CTA placeholder) | – | standard (bullet markers) | – | – |
| Pain Points | – | standard (three pain cards) | – | – | standard (before belief list) |
| Outcomes | – | standard (three benefit cards) | – | – | – |
| Product Overview – How It Works | – | – | outline (step badges) | – | – |
| Product Overview – Blueprint Types | – | standard (list cards) | secondary (optional labels) | – | – |
| Product Overview – Founder Message | – | standard (testimonial container) | – | – | – |
| Product Overview – Closing CTA | standard (primary), secondary (support CTA if needed) | – | – | – | – |
| FAQ | – | – | – | standard (primary accordion), tabs (if multi-column needed) | – |
| Footer | link (text-style links) | – | – | – | standard (top separator) |

## 3. Allowed Categories & Variations
- **button**: destructive · link · outline · secondary · standard
- **card**: standard
- **badge**: destructive · outline · secondary · standard
- **accordion**: form · multi-level · standard · subtitle · tabs
- **separator**: standard

## 4. Level 3 Patterns (Installed)
- button / standard → `pattern-button-standard-3` (installed) — Hero + CTA buttons
- button / destructive → `pattern-button-destructive-1` (installed) — Not used yet; available for future destructive CTAs
- button / link → `pattern-button-link-1` (installed) — Hero secondary link CTA
- button / outline → `pattern-button-outline-1` (installed) — Reserved for future outline CTA usage
- button / secondary → `pattern-button-secondary-1` (installed) — Secondary CTA in closing block
- card / standard → `pattern-card-standard-1` (installed) — Section cards (pain, outcomes, blueprint types)
- card / login-card → `pattern-card-standard-2` (installed) — Not currently used; available if login card needed later
- badge / standard → `pattern-badge-standard-3` (installed) — Hero bullet markers
- badge / outline → `pattern-badge-outline-1` (installed) — Process step numbering + founder message icon
- badge / secondary → `pattern-badge-secondary-1` (installed) — Section tags + blueprint icons
- badge / destructive → `pattern-badge-destructive-1` (installed) — “Problem isn’t” list markers
- accordion / standard → `pattern-accordion-standard-1` (installed) — FAQ accordion shell
- accordion / form → `pattern-accordion-form-1` (installed) — Not used currently
- accordion / multi-level → `pattern-accordion-multi-level-1` (installed) — Not used currently
- accordion / subtitle → `pattern-accordion-subtitle-2` (installed) — Not used currently
- accordion / tabs → `pattern-accordion-tabs-2` (installed) — Not used currently
- separator / standard → `pattern-separator-standard-1` unavailable in registry; substituted with `pattern-separator-basic-1` (installed) for horizontal rule styling

## 5. Content & Data Notes
- Reuse existing text arrays for bullets, pain points, outcomes, blueprint types, FAQ entries, and footer links.
- Buttons trigger `navigate('/login')` via `useRouter()`; keep navigation logic untouched.
- Badges display emoji/checkmarks supplied in copy; ensure pattern slots accept child text.
- Cards house emoji icon + heading + supporting copy; if pattern lacks icon slot, wrap emoji in preceding span.
- Accordion values must be stable keys (`item-0`, etc.) to preserve controlled state.
- Separators provide visual break between major subsections (hero → content, pain → belief list, footer).

## 6. Implementation Checklist
1. Gather Level 3 pattern numbers from user per category/variation above.
2. Install selected patterns with: `npx shadcn@latest add @my-patterns/pattern-[category]-[variation]-[number]`.
3. Replace shadcn primitives in `src/pages/Landing.tsx` with installed pattern components while applying section structure outlined in Section 2.
4. Remove unused imports and adjust styling wrappers (`bg-card`, `border-border`, etc.) to match pattern expectations.
5. Run project verification commands (`npm run lint`, `npm run test` if available).

## 7. Direct Category Links for Level 3 Browsing
- button: https://www.kibo-ui.com/patterns/button
- card: https://www.kibo-ui.com/patterns/card
- badge: https://www.kibo-ui.com/patterns/badge
- accordion: https://www.kibo-ui.com/patterns/accordion
- separator: https://www.kibo-ui.com/patterns/separator

## 8. Status
- Awaiting Level 3 pattern selections.
- Last updated: 2025-11-06.
