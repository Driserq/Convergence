# Feedback Page Design

## Purpose
- Give authenticated, verified users a dedicated space to send product feedback directly to the Consum team.
- Provide a lightweight text-first workflow that still honors Consum’s heavy-weight interaction styling for forms.
- Reinforce trust by showing clear success/error states and reminding users about the daily submission limit.

## Layout & Flow
1. **Intro Block** – Page title (“Feedback”) plus short helper copy describing the intent and 10 submissions / 24h policy.
2. **Form Card** – Centered, max-w-lg container with a single message textarea, helper text, and live character counter.
3. **Status Surface** – Inline success/error alert below the form to keep context without modal interruptions.
4. **Navigation** – Uses existing authenticated navigation shell; page remains accessible via new “Feedback” menu item.

## Required Components (Level 1 → Level 2)
- **navigation-menu → standard** – Reuse the shared authenticated navigation with a new entry pointing to `/feedback`.
- **form → validation** – Wraps the textarea, helper copy, submit button, loading state, and inline errors.
- **field → text-areas** – Provides message label, description, validation text, and the 500-character counter.
- **button → standard** – Primary “Submit feedback” CTA with loading/disabled states.
- **alert → success** – Confirms delivery (“Thanks! Your feedback has been sent.”) without redirecting away.
- **alert → error** – Surfaces rate-limit, validation, or email-delivery failures (e.g., “Uh-oh…” copy).
- **spinner → button** *(optional)* – Inline loader inside the submit button while the request is in flight.

> **Level 3 Pattern Selection**: User will choose specific pattern numbers for each component type by browsing https://www.kibo-ui.com/patterns. We’ll install the chosen patterns into `/components/feedback/` before assembling the page.

## Content & Logic Notes
- Enforce 500-character limit with client-side validation (Zod) and a live counter (`500 - currentLength`).
- Show helper text reminding users about the 10 submissions per 24 hours rule; display remaining submissions returned by the API when available.
- Upon successful submission: reset textarea, show success alert, and keep navigation context intact.
- On failure (rate limit, validation, or email send error): keep textarea contents, highlight error alert, and instruct user to email `kuba@consum.app` if needed.

## Status
- Design approved 2025-12-05.
- Awaiting Level 3 pattern selections before component installation and implementation.
