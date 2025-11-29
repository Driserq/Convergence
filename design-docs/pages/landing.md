# Landing Page Design Document

## 1. Goals & Audience
- Convert first‑time visitors into authenticated users by routing the hero CTA to `/login` (or `/dashboard` when already signed in).
- Tell a cohesive story that moves visitors from pain awareness → product explanation → proof → action.
- Follow Convergence design-weight guidance: lightweight hero, medium-weight storytelling sections, heavy-weight CTA + FAQ.

## 2. Section Blueprint
| Section | Purpose | Context Weight | Components (Level 1 → Level 2) | Notes |
| --- | --- | --- | --- | --- |
| Hero + Sticky Header | Consum brand intro, nav, primary CTA | Lightweight | button → standard, button → link | Full-screen hero with glass overlay, raw lucide icons only; keep text focus and generous whitespace. |
| Relevance Grid | Qualify who Consum serves + inline CTA | Medium | card → standard, button → standard | Three hoverable cards with Check icons per guideline; CTA button centered below grid. |
| Value Statements | Deliver bold claims in premium layout | Medium | card → standard (glass style) | Stack four statements inside translucent containers with emerald accent line; no heavy borders. |
| How It Works Timeline | Explain 7-step workflow | Medium | badge → outline (step numbers), separator → standard (vertical line) | Vertical timeline with numbered chips, connector line, detailed copy beside each step. |
| Pricing Deck | Present Free / Pro / Lifetime tiers | Heavy | card → standard, badge → secondary, button → standard | Highlight Pro tier with badge + glow; include feature bullets + CTA per card. |
| Final CTA Panel | Reinforce conversion w/ strongest copy | Heavy | card → standard, button → standard | Full-bleed gradient band with elevated card + single CTA; link button optional. |
| FAQ (optional) | Address objections if needed | Heavy | accordion → standard | Keep existing accordion section available for future copy if requested. |
| Footer | Secondary nav + legal | Lightweight | separator → standard, button → link (optional) | Maintain minimal text links + separator above footer nav. |

## 3. Allowed Categories & Installed Patterns
- **button**: `pattern-button-standard-3`, `pattern-button-link-1`, `pattern-button-secondary-1`, `pattern-button-outline-1`, `pattern-button-destructive-1` (spare)
- **card**: `pattern-card-standard-1`, `pattern-card-standard-2`
- **badge**: `pattern-badge-standard-3`, `pattern-badge-secondary-1`, `pattern-badge-outline-1`, `pattern-badge-destructive-1`
- **accordion**: `pattern-accordion-standard-1`, `pattern-accordion-form-1`, `pattern-accordion-multi-level-1`, `pattern-accordion-subtitle-2`, `pattern-accordion-tabs-2`
- **separator**: `pattern-separator-basic-1` (stand-in for standard)

## 4. Content & Data Notes
- Shared marketing copy lives in `src/data/landingContent.ts` (hero content, relevance bullets, value claims, 7 timeline steps, pricing tiers, CTA band text, optional FAQ + footer links).
- Hero CTA still routes via `useRouter().navigate('/login')` (SPA) and `useNavigate('/login')` (SSR) with dashboard redirect when authenticated.
- Timeline numbers use `badge-outline-1` styling for chips; pricing cards lean on `badge-secondary-1` for Pro highlight and `pattern-button-standard-3` for CTAs.
- Final CTA uses heavy-weight `card-standard-1` styling with gradient background wrapper; secondary CTA optional per copy.
- Accordion IDs should remain deterministic (e.g., `faq-0`) if FAQ content returns.

## 5. Layout & Interaction Notes
- Section padding: hero `py-32` (min-h-screen), content sections `py-20`, pricing `py-24`, final CTA `py-20`, footer `py-12`.
- Grid behavior: `grid-cols-1 md:grid-cols-3` for relevance + pricing tiers, timeline uses single-column flex with `md:flex-row` alignment.
- Hover states: medium cards (relevance/value/pricing) use `hover:-translate-y-1 hover:shadow-lg`; timeline steps stay static but include subtle glow on number chips.
- Maintain mobile-first ordering; sticky header collapses nav to stacked buttons on small screens; timeline connector hidden on first item for accessibility.

## 6. Implementation Checklist
1. Update `src/data/landingContent.ts` with Consum hero, relevance, value claims, timeline steps, pricing tiers, CTA copy (plus optional FAQ/footer).
2. Rebuild `src/components/landing/LandingPageContent.tsx` to match new sections + progressive weight.
3. Keep `src/pages/Landing.tsx` and `pages/Landing.tsx` as thin wrappers pointing to shared component.
4. Remove unused imports, keep hero lightweight, ensure CTA logic respects auth state.
5. Run `npm run build` (no lint script available) before delivery.

## 7. Status
- Patterns confirmed as installed; Consum layout implementation in progress.
- Last updated: 2025-11-28.
