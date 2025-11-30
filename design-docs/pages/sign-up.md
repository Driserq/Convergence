# Sign Up Page Design

## Purpose
- Provide a dedicated entry point for new users to create an account with email/password or Google OAuth.
- Keep the experience consistent with Consum’s medium/heavy-weight auth patterns (card container, validated inputs, clear feedback).

## Layout & Flow
1. **Hero Shell** – Centered card on dark background mirroring the login layout.
2. **Sign Up Form** – Email, Password, Confirm Password fields with validation + submit CTA.
3. **Google OAuth CTA** – Shared button component for "Sign up with Google" immediately below the form.
4. **Secondary Links** – Text link back to Login plus link out to landing page.

## Required Components (Level 1 → Level 2)
- **form → validation** – Wraps the entire credential form with field-level error handling.
- **field → basic-inputs** – Email, password, confirm password inputs.
- **button → standard** – Primary "Create account" action.
- **button → secondary** – Shared Google OAuth button styling.
- **alert → destructive** – Inline error feedback (invalid input, Supabase error).
- **separator → standard** – Visual divider between credential form and OAuth action.

*Components already installed via @my-patterns and available under `/src/components/ui`. No additional pattern install needed for this page.*

## Content & Logic Notes
- Supabase `auth.signUp` must use `emailRedirectTo = https://consum.app/verify-email`.
- After successful submission, SPA navigation pushes to `/verify-email?email={encodedEmail}`.
- Google OAuth button reuses shared component documented in `shared-components.md` and calls Supabase `signInWithOAuth('google')` with redirect `https://consum.app/login`.

## Status
- Page implementation in progress.
- Last updated: 2025-11-30.
